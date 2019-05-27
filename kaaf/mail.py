import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from os.path import basename

from utils import MailConfigurationException


def create_mail(msg, body):
    msg['Subject'] = f'Kvitteringsskildring fra {body["name"]} ({body["id"]})'

    text = ''

    text += f'Laget av: {body.get("name", "")}\n'
    text += f'Annledning: {body.get("occasion", "")}\n'
    text += f'Beløp: {body.get("amount", "")}\n'
    text += f'Kommentar: {body.get("comment", "")}\n'
    text += f'Kvitteringsskildring er lagt ved i pdf og tex format'

    msg.attach(MIMEText(text))


def send_mail(mail_to, body, files):
    if 'MAIL_ADDRESS' not in os.environ or 'MAIL_PASSWORD' not in os.environ:
        raise MailConfigurationException()
    mail_from = os.environ['MAIL_ADDRESS']
    mail_password = os.environ['MAIL_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = mail_from
    msg['To'] = COMMASPACE.join(mail_to)
    msg['Date'] = formatdate(localtime=True)

    create_mail(msg, body)

    for f in files or []:
        filename = f'kvitteringsskildring.{basename(f).split(".")[1]}'
        with open(f, 'rb') as file:
            part = MIMEApplication(file.read(), Name=filename)
        part['Content-Disposition'] = f'attachment; filename="{filename}"'
        msg.attach(part)

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(mail_from, mail_password)
    server.sendmail(mail_from, mail_to, msg.as_string())
    server.close()
