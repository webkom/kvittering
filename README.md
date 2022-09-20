# Kvittering

[![Build Status](https://ci.webkom.dev/api/badges/webkom/kvittering/status.svg?ref=refs/heads/master)](https://ci.webkom.dev/webkom/kvittering)
[![kvittering](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/jitps9/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/jitps9/runs)

This docker image runs as a normal docker container, but can also run as a function in [OpenFaaS](https://www.openfaas.com/). This is not recommended at this time, as the PDF creation can take to long, and it might time-out.

Running on https://kvittering.abakus.no

### Getting started

This is one docker image that serves both the python api, and the next/react frontend, this is done by building the webapp as a static site, and serving it as static files through flask.

#### Option 1) Run just the frontend:

```sh
# Install all packages
$ yarn

# Start server
$ yarn dev
```

#### Option 2) Run the backend (with built frontend):

Requires [Poetry](https://python-poetry.org/docs/#installation)

```sh

# Make a virtual environment
$ python -m venv venv
$ source venv/bin/activate

# Install packages
$ poetry install

# Export the frontend and run the backend
$ yarn build && yarn export

# Start the server
$ python kaaf/server.py

```

> The webapp will be available on `localhost:5000`

#### OBS: Poppler

> One of the packages (`pdf2image`) will require `poppler` to work correctly with tmp files. Most linux distros come with this. For MacOS `brew install poppler`

### Environment variables

| Variable              | Function                                                                            |
| --------------------- | ----------------------------------------------------------------------------------- |
| `MAIL_ADDRESS`        | Set the mail address for generated receipts                                         |
| `SERVICE_ACCOUNT_STR` | Base64 encoded service account. This means the whole `.json` downloaded from google |
| `ENVIRONMENT`         | Set to "production" for sentry errors                                               |
| `SENTRY_DSN`          | Ingest errors to sentry                                                             |

> To create a `Base64Encoded` str use `cat <yourfile>.json | base64`

### Generating PDFs

It's nice to quickly generate `PDFs` when developing, without having to start up everything. To do this you can run:

```sh
$ python kaaf/generate-example.py signature.png output.pdf image0.png image1.png ...

```

Where `signature.png` and `imageN.png` are paths to image files (the latter images are optional)

### Testing

Run cypress tests

```sh
# In one shell
$ yarn dev

# In another shell
$ yarn cypress
```

### Deployment

New versions are automatically built and deployed when pushing to the `master` branch.
