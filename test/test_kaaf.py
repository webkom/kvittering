import json
import os

import handler
import utils

test_image = ''
with open('./test_image', 'r') as f:
    test_image = f.read()

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


def test_escape_latex():
    print("Trying to generate pdf with latex code in payload")
    directory = 'test_escape'
    try:
        handler.handle(
            json.dumps({
                **request_full,
                'comment':
                r'\input{file1} \n\n \include{file2}',
                'name':
                r'\input{file1} \n\n normal string',
                'committee':
                '\\input{file1} \\n\\n \\include{file2}',
            }), directory, None)
    except utils.MailConfigurationException:
        pass
    os.chdir('/app')
    with open(f'/app/{directory}/out.tex', 'r') as f:
        content = f.read()
    if r'\input' in content:
        raise Exception('"\\" should be escaped')
    if '\\include{file2}' in content:
        raise Exception('"\\" should be escaped')
    if 'normal string' not in content:
        raise Exception('')
    print('Ok')


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
        handle_and_cleanup(json.dumps({**request_full, 'name': ''}))
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
                **request_full, 'signature': 'hei på du'
            }))
    except utils.InvalidBodyException:
        pass
    else:
        raise Exception(
            f'The payload contained images that are not valid base64, there should be an InvalidBodyException'
        )
    print('Ok')


if __name__ == '__main__':
    test_escape_latex()
    test_create_image_file()
    test_request_full()
    test_fail_not_json()
    test_fail_random_json()
    test_fail_missing_fields()
    test_fail_not_base64()
