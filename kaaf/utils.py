import base64
import hashlib
import math
import os
import time
from subprocess import call


def mkdir(out):
    call(['mkdir', out])
    call(['cp', '-r', 'images', out])


def rmdir(out):
    call(['rm', '-r', out])


def get_hash(body):
    return hashlib.md5(bytes(body + str(time.time()), 'utf-8')).hexdigest()


def generate_pdf():
    call(['pdflatex', 'out.tex'], stdout=open(os.devnull, 'wb'))


def shorten_line_length(string):
    max_len = 1000
    return '\n'.join([
        string[i * max_len:(i + 1) * max_len]
        for i in range(0, math.ceil(len(string) / max_len))
    ])


def create_image_file(directory, image, image_file):
    try:
        decoded = base64.standard_b64decode(image)
    except ValueError as e:
        raise InvalidBodyException(str(e))
    with open(f'/app/{directory}/{image_file}.pdf', 'wb') as f:
        f.write(decoded)


class InvalidBodyException(Exception):
    pass


class PdfGenerationException(Exception):
    pass


class MailConfigurationException(Exception):
    pass
