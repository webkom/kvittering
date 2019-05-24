import json
import os
import re

import mail
from raven import Client
from utils import (InvalidBodyException, PdfGenerationException,
                   create_image_file, generate_pdf, get_hash, mkdir, rmdir,
                   shorten_line_length)


def save_field(tex, field, value):
    i = tex.index('%SAVED_FIELDS_END%')
    tex = (tex[:i] + f'%FIELD_BEGIN_{field}%\n' + '\n'.join(
        map(lambda s: '%' + s, value.split('\n'))) + '\n' + tex[i:])
    return tex


def load_fields(tex, body, directory):
    values = tex[tex.index('%SAVED_FIELDS_BEGIN%'):tex.
                 index('%SAVED_FIELDS_END%')].split('\n')[1:]
    value_begin_regex = re.compile('%FIELD_BEGIN_.+%')
    current_field = ''
    current_value = ''
    for line in values:
        if value_begin_regex.match(line) is not None:
            if current_field.startswith('image') or current_field.startswith(
                    'signature'):
                create_image_file(directory, current_value, current_field)
            elif len(current_field) != 0:
                body[current_field] = current_value
            current_field = line[1:-1].split('_')[-1]
            current_value = ''
        else:
            current_value += line[1:]
    if current_field.startswith('image') or current_field.startswith(
            'signature'):
        create_image_file(directory, current_value, current_field)
    elif len(current_field) != 0:
        body[current_field] = current_value


def is_valid_input(body):
    if 'create_template' in body:
        required_fields = ['name', 'accountNumber', 'mailfrom', 'signature']
    elif 'tex' in body:
        required_fields = ['date', 'amount', 'images']
    else:
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
        tex = save_field(tex, f'image{i}', shorten_line_length(image))
        graphics += f'\\newpage\n\\fbox{{\\includegraphics[width=\\textwidth,height=\\textheight,keepaspectratio]{{image{i}.pdf}}}}'
        i += 1
    tex = tex.replace('%EMBEDDED_GRAPHICS%', graphics)
    return tex


def add_signature(tex, signature, directory):
    create_image_file(directory, signature, 'signature')
    tex = save_field(tex, 'signature', shorten_line_length(signature))
    graphics = '\\fbox{{\\includegraphics[width=6cm]{{signature.pdf}}}}'
    tex = tex.replace('%SIGNATURE%', graphics)
    return tex


def generate_tex(values, directory):
    tex = ''
    if 'tex' in values and len(values['tex']) > 0:
        tex = values['tex']
    else:
        with open('/app/template.tex', 'r') as f:
            tex = ''.join(f.readlines())
        tex = save_field(tex, 'id', values['id'])
        tex = save_field(tex, 'name', values['name'])
        tex = save_field(tex, 'mailfrom', values['mailfrom'])

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
            tex = tex.replace(f'%{field.upper()}%', values[field])

    if 'images' in values:
        tex = add_images(tex, values['images'], directory)
    if 'signature' in values:
        tex = add_signature(tex, values['signature'], directory)

    if 'create_template' not in values:
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
    if 'create_template' in body:
        if (not isinstance(body['create_template'],
                           bool)) or (not body['create_template']):
            del body['create_template']

    if not is_valid_input(body):
        raise InvalidBodyException('Request body is invalid')

    directory = req_id
    mkdir(f'/app/{directory}/')

    if 'tex' in body and len(body['tex']) > 0:
        load_fields(body['tex'], body, directory)

    body['id'] = req_id

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
