import json
import os

import handler
import utils

test_image = ''
with open('./test_image', 'r') as f:
    test_image = f.read()
test_tex = ''
with open('./test_template.tex', 'r') as f:
    test_tex = f.read()

request_bad_format = 'This should not work'
request_bad_content = json.dumps({'field': 'blabla'})
request_full = {
    'date': 'just now',
    'occasion': 'testing',
    'amount': '1000 plebs',
    'comment': 'nope',
    'name': 'Kvitteringsen',
    'committee': 'pengekom',
    'accountNumber': '123123',
    'mailfrom': 'penger@penger.io',
    'signature': test_image,
    'images': [test_image]
}
request_create_template = {
    'name': 'Kvitteringsen',
    'committee': 'pengekom',
    'accountNumber': '123123',
    'mailfrom': 'penger@penger.io',
    'signature': test_image,
    'create_template': True
}
request_use_template = {
    'date': 'just now',
    'occasion': 'testing',
    'amount': '1000 plebs',
    'comment': 'nope',
    'images': [test_image],
    'tex': test_tex
}

# What should be added/TODO:
# -Check that the contents of the generated tex files match what is expected
# -This only checks the handle and handle_with_cleanup functions, it should
#   probably also check the req_handler that wraps them, and the actual endpoints
# -Check that the load_fields function works as expected


def check_cleanup(directory):
    if os.path.isdir(f'/app/{directory}'):
        raise Exception('Cleanup not working properly, directory still exists')


def handle_and_cleanup(req):
    directory = 'test_dir'
    try:
        handler.handle_with_cleanup(req, directory, None)
    finally:
        check_cleanup(directory)


def test_create_image_file():
    print("Trying to create image file from base64 encoding")
    utils.create_image_file('.', test_image, 'image_output')
    assert os.path.isfile('./image_output.pdf')
    print('Ok')


def test_request_full():
    print("Trying to post a normal request")
    try:
        handle_and_cleanup(json.dumps(request_full))
    except utils.MailConfigurationException:
        pass
    print('Ok')


def test_request_create_template():
    print("Trying to create a new template")
    try:
        handle_and_cleanup(json.dumps(request_create_template))
    except utils.MailConfigurationException:
        pass
    print('Ok')


def test_request_use_template():
    print("Trying to use a template")
    try:
        handle_and_cleanup(json.dumps(request_use_template))
    except utils.MailConfigurationException:
        pass
    print('Ok')


def test_fail_not_json():
    print("Trying to post payload that is not json")
    try:
        handle_and_cleanup(request_bad_format)
    except utils.InvalidBodyException:
        pass
    else:
        raise Exception(
            f'The payload was not json, there should be an InvalidBodyException'
        )
    print('Ok')


def test_fail_random_json():
    print("Trying to post a random json payload")
    try:
        handle_and_cleanup(request_bad_content)
    except utils.InvalidBodyException:
        pass
    else:
        raise Exception(
            f'The payload contained random json, there should be an InvalidBodyException'
        )
    print('Ok')


def test_fail_missing_fields():
    print("Trying to post payload that is missing some fields")
    try:
        handle_and_cleanup(
            json.dumps({
                **request_create_template, 'create_template': False
            }))
    except utils.InvalidBodyException:
        pass
    else:
        raise Exception(
            f'The payload missed some fields, there should be an InvalidBodyException'
        )
    print('Ok')


def test_fail_not_base64():
    print("Trying to post signature that is not valid base64")
    try:
        handle_and_cleanup(
            json.dumps({
                **request_create_template, 'signature': 'hei på du'
            }))
    except utils.InvalidBodyException:
        pass
    else:
        raise Exception(
            f'The payload contained images that are not valid base64, there should be an InvalidBodyException'
        )
    print('Ok')


def test_fail_bad_tex():
    print("Trying to post incomplete tex template")
    try:
        handle_and_cleanup(
            json.dumps({
                **request_use_template, 'tex':
                request_use_template['tex'][:-100]
            }))
    except utils.PdfGenerationException:
        pass
    else:
        raise Exception(
            f'The payload contained an invalid tex template, there should be an InvalidBodyException'
        )
    print('^The logs from pdflatex are supposed to be printed')
    print('Ok')


if __name__ == '__main__':
    test_create_image_file()
    test_request_full()
    test_request_create_template()
    test_request_use_template()
    test_fail_not_json()
    test_fail_random_json()
    test_fail_missing_fields()
    test_fail_not_base64()
    test_fail_bad_tex()
