import base64
import functools
import io
import logging
import operator
import os
import tempfile

from email.utils import formatdate

# Handle HEIC photoes
import pyheif

from fpdf import FPDF

# Handle PDF files
from pdf2image import convert_from_path
from PIL import Image
from sentry_sdk import configure_scope

import mail


class UnsupportedFileException(Exception):
    pass


field_title_map = {
    "name": "Navn:",
    "committee": "Komite:",
    "accountNumber": "Kontonummer",
    "date": "Dato:",
    "occasion": "Anledning:",
    "amount": "Beløp:",
    "comment": "Kommentar:",
}


def data_is_valid(data):
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
    return [f for f in fields if f not in data or len(data[f]) == 0]


class PDF(FPDF):
    def header(self):
        self.image("images/abakus.png", 10, 18, 33)
        self.image("images/netcompany.png", 160, 11, 40)
        self.set_font("Arial", "B", 15)
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Side {str(self.page_no())}/{{nb}}", 0, 0, "C")


def image_to_byte_array(image: Image, fmt=None):
    imgByteArr = io.BytesIO()
    image.save(imgByteArr, format=fmt if fmt is not None else image.format)
    imgByteArr = imgByteArr.getvalue()
    return imgByteArr


def create_image_file(image):
    """
    Take an image in BASE64 format and return a NamedTemporaryFile containing the image.
    Will handle PNG, JPEG and GIF without any changes, as FPDF will handle those files
    without problem. For PDFs we use pdf2image to convert each page to an image. For HEIC
    pictures we use pyheif to convert it to a jpeg.
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
            f = tempfile.NamedTemporaryFile(suffix=f".{suffix}")
            f.write(image_to_byte_array(img))
            files.append({"file": f, "type": "jpeg"})
            f.flush()
        return files

    """
    FPDF does not support heic files as input, therefore we covert a image:heic image:jpg
    """
    if suffix == "heic":
        fmt = "JPEG"
        heif_file = pyheif.read(f.name)
        img = Image.frombytes(
            heif_file.mode,
            heif_file.size,
            heif_file.data,
            "raw",
            heif_file.mode,
            heif_file.stride,
        )
        f = tempfile.NamedTemporaryFile(suffix=f".{fmt}")
        f.write(image_to_byte_array(img, fmt))
        f.flush()
        return [{"file": f, "type": fmt}]

    return [{"file": f, "type": suffix.upper()}]


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
    pdf.set_font("Arial", "B", 16)

    signature = data.pop("signature")
    images = data.pop("images")

    pdf.cell(0, 14, f"Kvitteringsskjema mottatt {formatdate(localtime=True)}", ln=1)

    pdf.set_font("Arial", "", 12)
    for key in field_title_map.keys():
        pdf.set_font("", "B")
        pdf.cell(90, 5, txt=field_title_map[key])
        pdf.set_font("", "")
        pdf.multi_cell(0, 5, txt=data[key])

    pdf.set_font("", "B")
    pdf.cell(0, 5, txt="Signatur:", ln=1)
    pdf.image(signature["file"].name, h=30, type=signature["type"])
    signature["file"].close()
    pdf.cell(0, 5, txt="Vedlegg:", ln=1)
    max_img_width = 190
    max_img_height = 220
    for image in images:
        img = Image.open(image["file"].name)
        w, h = img.size
        img.close()

        size = (
            {"w": max_img_width}
            if w / h >= max_img_width / max_img_height
            else {"h": max_img_height}
        )

        pdf.image(image["file"].name, **size, type=image["type"])
        image["file"].close()
    return pdf.output(dest="S")


def handle(data):
    # Add some info about the user to the scope
    with configure_scope() as scope:
        scope.user = {
            "name": data["name"],
            "mailfrom": data["mailFrom"],
            "mailto": data["mailTo"],
        }
    req_fields = data_is_valid(data)
    if len(req_fields) > 0:
        return f'Requires fields {", ".join(req_fields)}', 400

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
