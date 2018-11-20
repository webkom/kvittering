import hashlib
import json
import math
import os
import re
import sys
import time
from subprocess import call


def log(message):
    print(json.dumps(message), file=sys.stderr)


def mkdir(out):
    call(['mkdir', out])
    call(['cp', '-r', 'images', out])


def rmdir(out):
    call(['rm', '-r', out])


def get_hash(json):
    return hashlib.md5(bytes(json + str(time.time()), 'utf-8')).hexdigest()


def generate_pdf():
    call(['pdflatex', 'out.tex'], stdout=open(os.devnull, 'wb'))


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


def get_stdin():
    buf = ''
    for line in sys.stdin:
        buf = buf + line
    return buf
