import base64
import datetime
import json
import logging
import os
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate

from google.oauth2 import service_account
from googleapiclient.discovery import build


class MailConfigurationException(Exception):
    pass


def service_account_login(mail_from, service_account_str):
    SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(base64.b64decode(service_account_str)), scopes=SCOPES
    )
    delegated_credentials = credentials.with_subject(mail_from)
    return build("gmail", "v1", credentials=delegated_credentials)


def create_mail(msg, body):
    msg[
        "Subject"
    ] = f'Kvitteringsskjema fra {body["name"]}, {formatdate(localtime=True)}'

    text = ""
    text += f'Laget av: {body.get("name", "")}\n'
    text += f'Anledning: {body.get("occasion", "")}\n'
    text += f'Beløp: {body.get("amount", "0")}\n'
    text += f'Kommentar: {body.get("comment", "")}\n'
    text += f"Kvitteringsskjema er lagt ved i pdf"

    msg.attach(MIMEText(text))


def send_mail(mail_to, body, file):
    if "MAIL_ADDRESS" not in os.environ or "SERVICE_ACCOUNT_STR" not in os.environ:
        raise MailConfigurationException("Mail isn't configured properly")
    mail_from = os.environ["MAIL_ADDRESS"]
    service_account_str = os.environ["SERVICE_ACCOUNT_STR"]

    msg = MIMEMultipart()
    msg["From"] = mail_from
    msg["To"] = COMMASPACE.join(mail_to)
    msg["Date"] = formatdate(localtime=True)

    create_mail(msg, body)

    occasion = f"-{body['occasion']}" if "occasion" in body else ""

    filename = (
        f"Kvitteringsskjema-{body['name']}{occasion}-{datetime.date.today()}.pdf"
    )
    part = MIMEApplication(file, Name=filename)
    part["Content-Disposition"] = f'attachment; filename="{filename}"'
    msg.attach(part)

    logging.info(f'Sending mail to {", ".join(mail_to)}')

    service = service_account_login(mail_from, service_account_str)
    raw = base64.urlsafe_b64encode(msg.as_bytes())
    body = {"raw": raw.decode()}
    messages = service.users().messages()
    messages.send(userId="me", body=body).execute()
