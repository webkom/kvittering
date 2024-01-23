import os

from flask import Flask
from flask import request
from gevent.pywsgi import WSGIServer

from handler import handle


static_file_directory = os.environ.get("STATIC_DIRECTORY", "../webapp/out/")

if os.environ.get("ENVIRONMENT") == "production":
    import sentry_sdk

    from sentry_sdk.integrations.flask import FlaskIntegration

    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        environment=os.environ.get("ENVIRONMENT"),
        integrations=[FlaskIntegration()],
        traces_sample_rate=1.0,
    )

app = Flask(__name__, static_folder=static_file_directory, static_url_path="")


@app.before_request
def fix_transfer_encoding():
    """
    From of-watchdog python-flask template
    """

    transfer_encoding = request.headers.get("Transfer-Encoding", None)
    if transfer_encoding == "chunked":
        request.environ["wsgi.input_terminated"] = True


@app.route("/")
def index_route():
    return app.send_static_file("index.html")


@app.route("/generate", methods=["POST"])
def main_route():
    response, status = handle(request.json)
    return response, status


if __name__ == "__main__":
    http_server = WSGIServer(("", 5000), app)
    http_server.serve_forever()
