import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from os.path import basename


def send_mail(mail_to, body, files):
    mail_from = os.environ['MAIL_ADDRESS']
    mail_password = os.environ['MAIL_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = mail_from
    msg['To'] = COMMASPACE.join(mail_to)
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = 'Kvitteringsskildring fra {0}'.format(
        body['name']) if 'tex' not in body else 'Kvitteringsskildring ferdig'

    text = ''

    if 'tex' not in body:
        text += 'Laget av: {0}\n'.format(body.get('name', ''))
        text += 'Annledning: {0}\n'.format(body.get('occasion', ''))
        text += 'Beløp: {0}\n'.format(body.get('amount', ''))
        text += 'Kommentar: {0}\n'.format(body.get('comment', ''))
        text += 'Kvitteringsskildring er lagt ved i pdf og tex format'

    msg.attach(MIMEText(text))

    for f in files or []:
        with open(f, 'rb') as fil:
            part = MIMEApplication(fil.read(), Name=basename(f))
        part['Content-Disposition'] = 'attachment; filename="{0}"'.format(
            basename(f))
        msg.attach(part)

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(mail_from, mail_password)
    server.sendmail(mail_from, mail_to, msg.as_string())
    server.close()
