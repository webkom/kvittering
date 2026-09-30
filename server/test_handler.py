import base64
import io
import os

import pytest

from PIL import ExifTags
from PIL import Image

from . import handler
from .handler import create_pdf
from .handler import modify_data


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


@pytest.fixture(autouse=True)
def run_from_repo_root(monkeypatch):
    monkeypatch.chdir(REPO_ROOT)


def data_url(filename, mime):
    with open(os.path.join(FIXTURES, filename), "rb") as f:
        return bytes_data_url(f.read(), mime)


def bytes_data_url(raw, mime):
    return f"data:{mime};base64," + base64.b64encode(raw).decode()


def encode_image(img, fmt, **params):
    buf = io.BytesIO()
    img.save(buf, fmt, **params)
    return buf.getvalue()


def photo(size):
    gradient = Image.linear_gradient("L").resize(size)
    noise = [Image.effect_noise(size, 12) for _ in range(3)]
    return Image.merge("RGB", [Image.blend(gradient, n, 0.3) for n in noise])


def form_data(**overrides):
    data = {
        "name": "Ola Nordmann",
        "mailFrom": "ola@example.com",
        "group": "Webkom",
        "mailTo": "webkom@abakus.no",
        "accountNumber": "12345678901",
        "amount": 123.5,
        "date": "2026-08-30",
        "occasion": "Fest",
        "comment": "",
        "signature": data_url("signature.png", "image/png"),
        "images": [data_url("signature.png", "image/png")],
    }
    return {**data, **overrides}


def test_create_pdf_supports_characters_outside_latin1():
    """Regression test for KVITTERING-71 and KVITTERING-72"""
    data = form_data(
        name="Kari Łukasz",
        occasion="Fest 😎 “smart quotes” – en dash",
        comment="Kommentar med emoji 😎🎉 og æøå",
    )

    pdf = create_pdf(modify_data(data))

    assert pdf.startswith(b"%PDF")
    assert b"DejaVuSans" in pdf
    assert b"NotoEmoji" in pdf


def test_heic_attachment_is_converted_to_jpeg():
    """Regression test for KVITTERING-4C"""
    data = modify_data(form_data(images=[data_url("image.heic", "image/heic")]))

    assert len(data["images"]) == 1
    with Image.open(data["images"][0].name) as img:
        assert img.format == "JPEG"
        assert img.size == (64, 32)

    pdf = create_pdf(data)

    assert pdf.startswith(b"%PDF")


def test_hdr_jpeg_attachment_is_not_inflated():
    """HDR phone JPEGs embed a gain map (MPF), which Pillow opens as MPO"""
    hdr_jpeg = encode_image(
        photo((2000, 1500)), "MPO", save_all=True, append_images=[photo((500, 375))]
    )

    pdf = create_pdf(
        modify_data(form_data(images=[bytes_data_url(hdr_jpeg, "image/jpeg")]))
    )

    assert len(pdf) < 2 * len(hdr_jpeg)


def test_attachment_is_rotated_upright_and_downscaled():
    exif = Image.Exif()
    exif[ExifTags.Base.Orientation] = 6
    portrait_photo = encode_image(Image.new("RGB", (4000, 3000)), "JPEG", exif=exif)

    data = modify_data(form_data(images=[bytes_data_url(portrait_photo, "image/jpeg")]))

    with Image.open(data["images"][0].name) as img:
        assert img.size == (1800, 2400)


def test_transparent_signature_is_flattened_on_white():
    signature = encode_image(Image.new("RGBA", (10, 10), (0, 0, 0, 0)), "PNG")

    data = modify_data(form_data(signature=bytes_data_url(signature, "image/png")))

    with Image.open(data["signature"].name) as img:
        assert img.getpixel((5, 5)) == (255, 255, 255)


def test_handle_rejects_pdf_over_gmail_size_limit(monkeypatch):
    monkeypatch.setattr(handler, "MAX_PDF_BYTES", 1000)

    response, status = handler.handle(form_data())

    assert status == 400
    assert "for stort" in response
