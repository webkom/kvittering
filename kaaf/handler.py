import hashlib
import json
import math
import os
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


def is_valid_input(body):
    required_fields = []

    for field in required_fields:
        if field not in body:
            return False
    return "mailto" in body or "mailfrom" in body


def shorten_line_length(string):
    max_len = 1000
    return '\n'.join([
        string[i * max_len:(i + 1) * max_len]
        for i in range(0, math.ceil(len(string) / max_len))
    ])


def add_images(tex, images):
    i = 0
    embedded = ''
    immediate = ''
    graphics = ''
    for image in images:
        image = shorten_line_length(image)
        embedded += '\\begin{{filecontents*}}{{\jobname.embedded{0}}}\n{1}\n\\end{{filecontents*}}\n'.format(
            i, image)
        immediate += '\\immediate\\write18{{base64 -d \\jobname.embedded{0} > \\jobname-tmp{0}.pdf}}\n'.format(
            i)
        graphics += '\\newpage\n\\fbox{{\\includegraphics[width=\\textwidth,height=\\textheight,keepaspectratio]{{\\jobname-tmp{0}.pdf}}}}'.format(
            i)
        i += 1
    tex = tex.replace('%EMBEDDED_IMAGES%', embedded)
    tex = tex.replace('%EMBEDDED_IMMEDIATE%', immediate)
    tex = tex.replace('%EMBEDDED_GRAPHICS%', graphics)
    return tex


def add_signature(tex, signature, signature2=False):
    signature = shorten_line_length(signature)
    filename = 'signature'
    if signature2:
        filename += "2"
    embedded = '\\begin{{filecontents*}}{{\jobname.embedded{0}}}\n{1}\n\\end{{filecontents*}}\n'.format(
        filename, signature)
    immediate = '\\immediate\\write18{{base64 -d \\jobname.embedded{0} > \\jobname-tmp{0}.pdf}}\n'.format(
        filename)
    graphics = '\\newpage\n\\fbox{{\\includegraphics[width=6cm]{{\\jobname-tmp{0}.pdf}}}}'.format(
        filename)
    tex = tex.replace(
        '%EMBEDDED_SIGNATURE{0}%'.format(2 if signature2 else ""), embedded)
    tex = tex.replace(
        '%SIGNATURE_IMMEDIATE{0}%'.format(2 if signature2 else ""), immediate)
    tex = tex.replace('%SIGNATURE{0}%'.format(2 if signature2 else ""),
                      graphics)
    return tex


def generate_tex(values, directory):
    tex = ''
    if "tex" in values:
        tex = values['tex']
    else:
        with open('template.tex', 'r') as f:
            tex = ''.join(f.readlines())
    for field, value in values.items():
        if field == 'images':
            tex = add_images(tex, value)
        elif field == 'signature':
            tex = add_signature(tex, value)
        elif field == 'signature2':
            tex = add_signature(tex, value, True)
        else:
            tex = tex.replace('%{0}%'.format(field.upper()), value)
    tex = tex.replace('%RECEIPT%', '{0} vedlegg'.format(
        len(values.get('images') or [])))
    with open('{0}/out.tex'.format(directory), 'w') as f:
        f.write(tex)


def generate_pdf():
    call(['pdflatex', '--shell-escape', 'out.tex'],
         stdout=open(os.devnull, 'wb'))


def handle(req):
    directory = get_hash(req)
    mkdir(directory)

    body = json.loads(req)

    if not is_valid_input(body):
        return

    generate_tex(body, directory)

    os.chdir(directory)
    generate_pdf()
    # with open('out.pdf', 'rb') as f:
    #     sys.stdout.buffer.write(f.read())

    send_to = []

    if "mailfrom" in body:
        send_to.append(body['mailfrom'])
    if "mailto" in body:
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
