import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from os.path import basename

from utils import log


def create_mail(msg, body):
    msg['Subject'] = f'Kvitteringsskildring fra {body["name"]} ({body["id"]})'

    text = ''

    text += f'Laget av: {body.get("name", "")}\n'
    text += f'Annledning: {body.get("occasion", "")}\n'
    text += f'Beløp: {body.get("amount", "")}\n'
    text += f'Kommentar: {body.get("comment", "")}\n'
    text += f'Kvitteringsskildring er lagt ved i pdf og tex format'

    msg.attach(MIMEText(text))


def create_template_mail(msg, body):
    msg['Subject'] = f'Personlig skildringsmal for {body["name"]} ({body["id"]})'

    text = 'Last opp .tex filen neste gang du skal lage en kvitteringssklidring, så slipper du å fylle ut en del felter'

    msg.attach(MIMEText(text))


def send_mail(mail_to, body, files):
    mail_from = os.environ['MAIL_ADDRESS']
    mail_password = os.environ['MAIL_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = mail_from
    msg['To'] = COMMASPACE.join(mail_to)
    msg['Date'] = formatdate(localtime=True)

    create_template = 'create_template' in body and body['create_template']

    if create_template:
        create_template_mail(msg, body)
    else:
        create_mail(msg, body)

    for f in files or []:
        filename = f'{"skildringsmal" if create_template else "kvitteringsskildring"}.{basename(f).split(".")[1]}'
        with open(f, 'rb') as file:
            part = MIMEApplication(file.read(), Name=filename)
        part['Content-Disposition'] = f'attachment; filename="{filename}"'
        msg.attach(part)

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(mail_from, mail_password)
    server.sendmail(mail_from, mail_to, msg.as_string())
    server.close()

    log({
        'id': body['id'],
        'type': 'info',
        'message': f'Mail sendt to: {", ".join(mail_to)}'
    })
