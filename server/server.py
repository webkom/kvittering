import logging
import os

from flask import Flask
from flask import request
from gevent.pywsgi import WSGIServer


###
### Configuration
###

logging.basicConfig(
    format="%(asctime)s %(message)s",
    datefmt="[%Y-%m-%d %H:%M:%S]",
    level=logging.INFO,
)

if os.environ.get("ENVIRONMENT") != "production":
    logging.info("[Development mode] Loading ../webapp/.env")
    import sys

    from dotenv import load_dotenv

    load_dotenv(sys.path[0] + "/../webapp/.env")

if os.environ.get("ENVIRONMENT") == "production":
    import sentry_sdk

    from sentry_sdk.integrations.flask import FlaskIntegration

    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        environment=os.environ.get("ENVIRONMENT"),
        integrations=[FlaskIntegration()],
        traces_sample_rate=1.0,
    )

###
### Flask
###

static_file_directory = os.environ.get(
    "STATIC_DIRECTORY", "../webapp/.next/server/pages/"
)

app = Flask(__name__, static_folder=static_file_directory, static_url_path="")

if os.environ.get("ENVIRONMENT") != "production":
    logging.info("[Development mode] Disabling CORS")
    from flask_cors import CORS

    CORS(app)


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
    from handler import handle

    response, status = handle(request.json)
    return response, status


###
### Run server
###

if __name__ == "__main__":
    http_server = WSGIServer(("", int(os.environ.get("API_PORT", 5000))), app)
    logging.info(
        f"Starting server on {http_server.server_host}:{http_server.server_port}"
    )
    http_server.serve_forever()
    logging.info("Serving...")
