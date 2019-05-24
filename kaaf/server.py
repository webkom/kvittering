import sys

from flask import Flask, request
from gevent.pywsgi import WSGIServer
from handler import req_handler

app = Flask(__name__)


@app.before_request
def fix_transfer_encoding():
    transfer_encoding = request.headers.get("Transfer-Encoding", None)
    if transfer_encoding == u"chunked":
        request.environ["wsgi.input_terminated"] = True


@app.route("/", defaults={"path": ""}, methods=["POST"])
def main_route(path):
    response, status = req_handler(request.get_data().decode('utf-8'))
    return response, status


@app.after_request
def flush_streams(response):
    sys.stdout.flush()
    sys.stderr.flush()
    return response


if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
