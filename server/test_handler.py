import base64
import os

import pytest

from PIL import Image

from .handler import create_pdf
from .handler import modify_data


REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


@pytest.fixture(autouse=True)
def run_from_repo_root(monkeypatch):
    monkeypatch.chdir(REPO_ROOT)


def data_url(filename, mime):
    with open(os.path.join(FIXTURES, filename), "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


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
