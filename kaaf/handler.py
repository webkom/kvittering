import json
import os
import re

import mail
from raven import Client
from utils import (InvalidBodyException, PdfGenerationException,
                   create_image_file, escape_latex, generate_pdf, get_hash,
                   mkdir, rmdir, shorten_line_length)


def is_valid_input(body):
    required_fields = [
        'date', 'amount', 'name', 'accountNumber', 'mailfrom', 'signature',
        'images'
    ]

    for field in required_fields:
        if field not in body:
            return False
    return True


def add_images(tex, images, directory):
    i = 0
    graphics = ''
    for image in images:
        create_image_file(directory, image, f'image{i}')
        graphics += f'\\newpage\n\\fbox{{\\includegraphics[width=\\textwidth,height=\\textheight,keepaspectratio]{{image{i}.pdf}}}}'
        i += 1
    tex = tex.replace('%EMBEDDED_GRAPHICS%', graphics)
    return tex


def add_signature(tex, signature, directory):
    create_image_file(directory, signature, 'signature')
    graphics = '\\fbox{{\\includegraphics[width=6cm]{{signature.pdf}}}}'
    tex = tex.replace('%SIGNATURE%', graphics)
    return tex


def generate_tex(values, directory):
    tex = ''
    with open('/app/template.tex', 'r') as f:
        tex = f.read()

    tex_fields = [
        'date',
        'occasion',
        'amount',
        'comment',
        'name',
        'committee',
        'accountNumber',
    ]

    for field in tex_fields:
        if field in values and len(values[field]) > 0:
            tex = tex.replace(f'%{field.upper()}%',
                              escape_latex(values[field]))

    if 'images' in values:
        tex = add_images(tex, values['images'], directory)
    if 'signature' in values:
        tex = add_signature(tex, values['signature'], directory)

    tex = tex.replace('%RECEIPT%',
                      f'{len(values.get("images") or [])} vedlegg')

    with open(f'/app/{directory}/out.tex', 'w') as f:
        f.write(tex)


def handle(req, req_id, client):
    try:
        body = json.loads(req)
    except Exception as e:
        raise InvalidBodyException('Could not decode json')

    for key in list(body.keys()):
        if isinstance(body[key], str) and len(body[key]) == 0:
            del body[key]

    if not is_valid_input(body):
        raise InvalidBodyException('Request body is invalid')

    body['id'] = req_id
    directory = req_id
    mkdir(f'/app/{directory}/')

    if (client is not None):
        client.user_context({'email': body.get('mailfrom')})

    generate_tex(body, directory)
    os.chdir(f'/app/{directory}')
    generate_pdf()
    if not os.path.isfile(f'/app/{directory}/out.pdf'):
        pdf_log = ''
        with open(f'/app/{directory}/out.log', 'r') as f:
            pdf_log = f.read()
        print(pdf_log)
        raise PdfGenerationException("PDF file could not be produced")

    send_to = []

    if 'mailfrom' in body:
        send_to.append(body['mailfrom'])
    if 'mailto' in body:
        send_to.append(body['mailto'])

    mail.send_mail(send_to, body, ['out.tex', 'out.pdf'])


def handle_with_cleanup(req, req_id, client):
    try:
        handle(req, req_id, client)
    finally:
        if os.path.isdir(f'/app/{req_id}'):
            os.chdir('/app')
            rmdir(f'/app/{req_id}')


def req_handler(req):
    if ('SENTRY_KEY' in os.environ and 'SENTRY_SECRET' in os.environ
            and 'SENTRY_PROJECT' in os.environ):
        client = Client(
            dsn=
            f'https://{os.environ["SENTRY_KEY"]}:{os.environ["SENTRY_SECRET"]}@sentry.abakus.no/{os.environ["SENTRY_PROJECT"]}',
        )
    else:
        client = None
    req_id = get_hash(req)
    try:
        handle_with_cleanup(req, req_id, client)
    except InvalidBodyException as e:
        if (client is not None):
            client.captureException()
        return "Det var noe galt med dataen som ble sendt inn", 400
    except PdfGenerationException as e:
        if (client is not None):
            client.captureException()
        return "Det skjedde noe galt under genereringen av PDF", 500
    except Exception as e:
        if (client is not None):
            client.captureException()
        return "Det skjedde noe galt under behandling av forespørselen, kontakt Webkom eller prøv igjen.", 500

    return "Kvitteringsskildring generert og sendt på mail.", 200
