import hashlib
import json
import math
import os
import re
import sys
import time
from subprocess import call

import mail


def mkdir(out):
    call(['mkdir', out])
    call(['cp', '-r', 'images', out])


def rmdir(out):
    call(['rm', '-r', out])


def get_hash(json):
    return hashlib.md5(bytes(json + str(time.time()), 'utf-8')).hexdigest()


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
    return 'mailto' in body or 'mailfrom' in body


def shorten_line_length(string):
    max_len = 1000
    return '\n'.join([
        string[i * max_len:(i + 1) * max_len]
        for i in range(0, math.ceil(len(string) / max_len))
    ])


def create_image_file(directory, image, image_file):
    with open(f'{directory}/{image_file}', 'w') as f:
        f.write(image)
    with open(f'{directory}/{image_file}.pdf', 'w') as f:
        call(['base64', '-di', f'{directory}/{image_file}'], stdout=f)


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
    if 'tex' in values:
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
        if field in values:
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


def generate_pdf():
    call(['pdflatex', 'out.tex'], stdout=open(os.devnull, 'wb'))


def handle(req):
    directory = get_hash(req)
    mkdir(directory)

    body = json.loads(req)

    if not is_valid_input(body):
        return

    if 'tex' in body:
        load_fields(body['tex'], body, directory)
    else:
        body['id'] = directory

    generate_tex(body, directory)

    os.chdir(directory)
    generate_pdf()
    # with open('out.pdf', 'rb') as f:
    #     sys.stdout.buffer.write(f.read())

    send_to = []

    if 'mailfrom' in body:
        send_to.append(body['mailfrom'])
    if 'mailto' in body:
        send_to.append(body['mailto'])

    mail.send_mail(send_to, body, ['out.tex', 'out.pdf'])

    os.chdir('/app')

    rmdir(directory)


def get_stdin():
    buf = ''
    for line in sys.stdin:
        buf = buf + line
    return buf


if __name__ == '__main__':
    st = get_stdin()
    handle(st)
