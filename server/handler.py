import base64
import functools
import io
import logging
import operator
import os
import tempfile

from email.utils import formatdate

from fpdf import FPDF
from pdf2image import convert_from_path
from PIL import Image

# Handle HEIC photos
from pillow_heif import register_heif_opener
from sentry_sdk import configure_scope


register_heif_opener()


class UnsupportedFileException(Exception):
    pass


field_title_map = {
    "name": "Navn:",
    "group": "Gruppe/komité:",
    "accountNumber": "Kontonummer:",
    "date": "Dato:",
    "occasion": "Anledning:",
    "amount": "Beløp:",
    "comment": "Kommentar:",
}


def get_missing_fields(data):
    fields = [
        "images",
        "date",
        "amount",
        "mailTo",
        "signature",
        "name",
        "accountNumber",
        "mailFrom",
    ]
    return [f for f in fields if f not in data or not data[f]]


def validate_fields(data):
    errors = []
    try:
        float(data["amount"])
    except ValueError:
        errors.append("invalid amount")
    if len(data["accountNumber"]) != 11:
        errors.append("account number has to be 11 digits")
    return errors


class PDF(FPDF):
    def __init__(self):
        super().__init__()
        # Core fonts are latin-1 only; DejaVu covers Unicode, Noto Emoji fills in emojis
        self.add_font("DejaVu", style="", fname="fonts/DejaVuSans.ttf")
        self.add_font("DejaVu", style="B", fname="fonts/DejaVuSans-Bold.ttf")
        self.add_font("DejaVu", style="I", fname="fonts/DejaVuSans-Oblique.ttf")
        self.add_font("NotoEmoji", style="", fname="fonts/NotoEmoji-Regular.ttf")
        self.set_fallback_fonts(["NotoEmoji"], exact_match=False)

    def header(self):
        self.image("images/abakus.png", 10, 18, 33)
        self.image("images/bekk.png", 160, 18, 30)
        self.set_font("DejaVu", "B", 15)
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "I", 8)
        self.cell(0, 10, f"Side {self.page_no()}/{{nb}}", align="C")


def image_to_byte_array(image: Image, fmt=None):
    imgByteArr = io.BytesIO()
    image.save(imgByteArr, format=fmt if fmt is not None else image.format)
    imgByteArr = imgByteArr.getvalue()
    return imgByteArr


def create_image_file(image):
    """
    Take an image in BASE64 format and return a list of NamedTemporaryFiles containing
    the image(s). PDFs are converted to one jpeg per page and HEIC to jpeg.
    """

    if not "image/" in image and not "application/pdf" in image:
        raise UnsupportedFileException(image[:30])
    parts = image.split(";base64,")
    decoded = base64.b64decode(parts[1])
    suffix = "pdf" if "application/pdf" in image else parts[0].split("image/")[1]
    suffix = suffix.lower()
    f = tempfile.NamedTemporaryFile(suffix=f".{suffix}")
    f.write(decoded)
    f.flush()

    """
    FPDF does not support pdf files as input, therefore convert file:pdf to array[image:jpg]
    """
    if suffix == "pdf":
        files = []
        pil_images = convert_from_path(f.name, fmt="jpeg")
        for img in pil_images:
            f = tempfile.NamedTemporaryFile(suffix=".jpeg")
            f.write(image_to_byte_array(img))
            f.flush()
            files.append(f)
        return files

    """
    FPDF does not support heic files as input, therefore we convert a image:heic to image:jpg
    """
    if suffix == "heic":
        img = Image.open(f.name).convert("RGB")
        f = tempfile.NamedTemporaryFile(suffix=".jpeg")
        f.write(image_to_byte_array(img, "JPEG"))
        f.flush()
        return [f]

    return [f]


def modify_data(data):
    signature = data.pop("signature")
    images = data.pop("images")

    data["signature"] = create_image_file(signature)[0]
    data["images"] = functools.reduce(
        operator.iconcat, [create_image_file(img) for img in images], []
    )
    data["amount"] = "{:.2f} kr".format(float(data.get("amount", "0")))

    return data


def create_pdf(data):
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font("DejaVu", "B", 16)

    signature = data.pop("signature")
    images = data.pop("images")

    pdf.cell(
        0,
        14,
        f"Kvitteringsskjema mottatt {formatdate(localtime=True)}",
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.set_font("DejaVu", "", 12)
    for key in field_title_map.keys():
        pdf.set_font(style="B")
        pdf.cell(90, 5, field_title_map[key])
        pdf.set_font(style="")
        field_value = data[key] if key in data else ""
        pdf.multi_cell(0, 5, field_value, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font(style="B")
    pdf.cell(0, 5, "Signatur:", new_x="LMARGIN", new_y="NEXT")
    pdf.image(signature.name, h=30)
    signature.close()
    pdf.cell(0, 5, "Vedlegg:", new_x="LMARGIN", new_y="NEXT")
    max_img_width = 190
    max_img_height = 220
    for image in images:
        img = Image.open(image.name)
        w, h = img.size
        img.close()

        size = (
            {"w": max_img_width}
            if w / h >= max_img_width / max_img_height
            else {"h": max_img_height}
        )

        pdf.image(image.name, **size)
        image.close()
    return bytes(pdf.output())


def handle(data):
    # Add some info about the user to the scope
    with configure_scope() as scope:
        scope.user = {
            "name": data["name"],
            "mailfrom": data["mailFrom"],
            "mailto": data["mailTo"],
        }
    req_fields = get_missing_fields(data)
    if len(req_fields) > 0:
        return f'Requires fields {", ".join(req_fields)}', 400

    validation_errors = validate_fields(data)
    if len(validation_errors) > 0:
        return f'Invalid fields {", ".join(validation_errors)}', 400

    try:
        data = modify_data(data)
    except UnsupportedFileException as e:
        logging.error(f"Unsupported file type: {e}")
        return (
            (
                "En av filene som ble lastet opp er ikke i støttet format. Bruk PNG,"
                " JPEG, GIF, HEIC eller PDF"
            ),
            400,
        )

    try:
        file = create_pdf(data)
        if os.environ.get("ENVIRONMENT") == "production":
            try:
                import mail

                mail.send_mail([data["mailTo"], data["mailFrom"]], data, file)
            except mail.MailConfigurationException as e:
                logging.warning(f"Failed to send mail: {e}")
                return f"Klarte ikke å sende email: {e}", 500
        else:
            from mailinglogger.summarisinglogger import SummarisingLogger

            handler = SummarisingLogger(data["mailFrom"], data["mailTo"])
            logging.basicConfig(
                format="%(asctime)s %(message)s",
                datefmt="%m/%d/%Y %I:%M:%S %p",
                level=logging.INFO,
            )
            logger = logging.getLogger()
            logger.addHandler(handler)
            logging.info("Sent by consolemail")
    except RuntimeError as e:
        logging.warning(f"Failed to generate pdf with exception: {e}")
        return f"Klarte ikke å generere pdf: {e}", 500
    except Exception as e:
        logging.error(f"Failed with exception: {e}")
        return f"Noe uventet skjedde: {e}", 400

    logging.info("Successfully generated pdf and sent mail")
    return "Kvitteringsskjema generert og sendt på mail!", 200
