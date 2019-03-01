import json
import os
import re
import sys

import mail
from raven import Client
from utils import (create_image_file, generate_pdf, get_hash, get_stdin, mkdir,
                   rmdir, shorten_line_length)


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
    if current_field.startswith('image'):
        create_image_file(directory, current_value, current_field)
    elif len(current_field) != 0:
        body[current_field] = current_value


def is_valid_input(body):
    required_fields = []

    for field in required_fields:
        if field not in body:
            return False
    return 'mailfrom' in body or 'tex' in body


def add_images(tex, images, directory):
    i = 0
    graphics = ''
    for image in images:
        create_image_file(directory, image, f'image{i}')
        image = shorten_line_length(image)
        tex = save_field(tex, f'image{i}', image)
        graphics += f'\\newpage\n\\fbox{{\\includegraphics[width=\\textwidth,height=\\textheight,keepaspectratio]{{image{i}.pdf}}}}'
        i += 1
    tex = tex.replace('%EMBEDDED_GRAPHICS%', graphics)
    return tex


def add_signature(tex, signature, directory):
    create_image_file(directory, signature, 'signature')
    signature = shorten_line_length(signature)
    tex = save_field(tex, 'signature', signature)
    graphics = '\\newpage\n\\fbox{{\\includegraphics[width=6cm]{{signature.pdf}}}}'
    tex = tex.replace('%SIGNATURE%', graphics)
    return tex


def generate_tex(values, directory):
    tex = ''
    if 'tex' in values and len(values['tex']) > 0:
        tex = values['tex']
    else:
        with open('template.tex', 'r') as f:
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

    with open(f'{directory}/out.tex', 'w') as f:
        f.write(tex)


def handle(req, req_id):
    body = json.loads(req)

    for key in list(body.keys()):
        if isinstance(body[key], str) and len(body[key]) == 0:
            del body[key]

    if not is_valid_input(body):
        raise Exception('Request body is invalid')

    directory = req_id
    mkdir(directory)

    if 'tex' in body and len(body['tex']) > 0:
        load_fields(body['tex'], body, directory)

    body['id'] = req_id

    if (client is not None):
        client.context.merge({
            'state': {
                'using_template': len(body.get('tex', '')) > 0
            }
        })
        client.user_context({'email': body.get('mailfrom')})

    generate_tex(body, directory)

    os.chdir(directory)
    try:
        generate_pdf()
        # with open('out.pdf', 'rb') as f:
        #     sys.stdout.buffer.write(f.read())
        if not os.path.isfile('./out.pdf'):
            pdf_log = ''
            with open('./out.log') as f:
                pdf_log = '\n'.join(f.readlines())
            client.context.merge({'logs': {'pdflatex': pdf_log[-300:]}})
            raise Exception("PDF file could not be produced")

        send_to = []

        if 'mailfrom' in body:
            send_to.append(body['mailfrom'])
        if 'mailto' in body:
            send_to.append(body['mailto'])

        mail.send_mail(send_to, body, ['out.tex', 'out.pdf'])
    finally:
        os.chdir('/app')
        rmdir(directory)


if __name__ == '__main__':
    if ('SENTRY_KEY' in os.environ and 'SENTRY_SECRET' in os.environ
            and 'SENTRY_PROJECT' in os.environ):
        client = Client(
            dsn=
            f'https://{os.environ["SENTRY_KEY"]}:{os.environ["SENTRY_SECRET"]}@sentry.abakus.no/{os.environ["SENTRY_PROJECT"]}',
        )
    else:
        client = None
    st = get_stdin()
    req_id = get_hash(st)
    try:
        handle(st, req_id)
        print("Kvitteringsskildring generert og sendt på mail.")
    except Exception as e:
        if (client is not None):
            client.captureException()
        print(
            "Det skjedde noe galt under behandling av forespørselen, kontakt Webkom eller prøv igjen."
        )
    else:
        pass
    finally:
        # Prevents sentry from writing to stdout at process termination
        # (and adding it to the response)
        sys.stdout = sys.stderr
