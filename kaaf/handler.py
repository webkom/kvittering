import logging
import json
import os
import re
import tempfile
import base64

from fpdf import FPDF

import mail

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
        "mailto",
        "signature",
        "name",
        "accountNumber",
        "mailfrom",
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


def create_image_file(image):
    parts = image.split(";base64,")
    decoded = base64.b64decode(parts[1])
    suffix = parts[0].split("image/")[1]
    f = tempfile.NamedTemporaryFile(suffix=f".{suffix}")
    f.write(decoded)
    f.flush()

    return {"file": f, "type": suffix.upper()}


def modify_data(data):
    signature = data.pop("signature")
    images = data.pop("images")

    data["signature"] = create_image_file(signature)
    data["images"] = [create_image_file(img) for img in images]

    return data


def create_pdf(data):
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)

    signature = data.pop("signature")
    images = data.pop("images")

    pdf.cell(0, 14, "Kvitteringsskildring", ln=1)

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
    for image in images:
        pdf.image(image["file"].name, h=100, type=image["type"])
        image["file"].close()
    return pdf.output(dest="S")


def handle(data):
    req_fields = data_is_valid(data)
    if len(req_fields) > 0:
        return f'Requires fields {", ".join(req_fields)}', 400

    data = modify_data(data)
    try:
        file = create_pdf(data)
        mail.send_mail([data["mailto"], data["mailfrom"]], data, file)
    except RuntimeError as e:
        logging.warning(f"Failed to generate pdf with exception: {e}")
        return f"Klarte ikke å generere pdf: {e}", 500
    except mail.MailConfigurationException as e:
        logging.warning(f"Failed to send mail: {e}")
        return f"Klarte ikke å sende mail: {e}", 500
    except Exception as e:
        logging.error(f"Failed with exception: {e}")
        return f"Noe uventet skjedde: {e}", 500

    logging.info("Successfully generated pdf and sent mail")
    return "Kvitteringsskildring generert og sendt på mail!", 200
