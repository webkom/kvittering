import logging
import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from os.path import basename


class MailConfigurationException(Exception):
    pass


def create_mail(msg, body):
    msg[
        "Subject"
    ] = f'Kvitteringsskildring fra {body["name"]}, {formatdate(localtime=True)}'

    text = ""
    text += f'Laget av: {body.get("name", "")}\n'
    text += f'Anledning: {body.get("occasion", "")}\n'
    text += f'Beløp: {body.get("amount", "")}\n'
    text += f'Kommentar: {body.get("comment", "")}\n'
    text += f"Kvitteringsskildring er lagt ved i pdf"

    msg.attach(MIMEText(text))


def send_mail(mail_to, body, file):
    if "MAIL_ADDRESS" not in os.environ or "MAIL_PASSWORD" not in os.environ:
        raise MailConfigurationException("Mail isn't configured properly. MAIL_FIKEN can be none")
    mail_from = os.environ["MAIL_ADDRESS"]
    mail_fiken = os.environ["MAIL_FIKEN"]
    mail_password = os.environ["MAIL_PASSWORD"]

    msg = MIMEMultipart()
    msg["From"] = mail_from
    msg["To"] = COMMASPACE.join(mail_to)
    msg["Date"] = formatdate(localtime=True)

    create_mail(msg, body)

    filename = "kvitteringsskildring.pdf"
    part = MIMEApplication(file, Name=filename)
    part["Content-Disposition"] = f'attachment; filename="{filename}"'
    msg.attach(part)

    logging.info(f'Sending mail to {", ".join(mail_to)}')

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(mail_from, mail_password)
    server.sendmail(mail_from, mail_to, mail_fiken, msg.as_string())
    server.close()
