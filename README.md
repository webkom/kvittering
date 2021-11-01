# Kvittering (as a function)

A docker image that runs in [OpenFaaS](https://www.openfaas.com/). Can also run as a normal docker container.

Running on https://kvittering.itdagene.no

### Getting started

This is one docker image that serves both the python api, and the next/react frontend, this is done by building the webapp as a static site, and serving it as static files through flask.

To run just the frontend:

- Install all packages with `yarn`
- Start the server with `yarn dev`, the webapp will be available at `localhost:3000`
- Export the static files with `yarn build && yarn export`

To run the backend/everything:

- Make a virtual env with `python -m venv venv`
- Enter the env with `source venv/bin/activate`
- Install packages with `pip install -r kaaf/req.txt`
- Start the server with `python kaaf/server.py`
- If the frontend is exported (`yarn export`), the webapp will be available at `localhost:5000` when running `server.py`

> One of the packages (pdf2image) will require poppler to work correctly with tmp files. Most linux distros come with this.
> For MacOS `brew install poppler`

### Environment variables

| Variable        | Function                                     |
| --------------- | -------------------------------------------- |
| `MAIL_ADDRESS`  | Set the mail address for geenerated receipts |
| `MAIL_PASSWORD` | Password for the mail account                |
| `ENVIRONMENT`   | Set to "production" for sentry errors        |
| `SENTRY_DSN`    | Ingest errors to sentry                      |

### Generating PDFs

It might be nice to be able to quickly generate PDFs when developing, without having to start up everything. To do this you can run:

```
python kaaf/generate-example.py signature.png output.pdf image0.png image1.png ...
```

Where `signature.png` and `imageN.png` are paths to image files (the latter images are optional)

### Deployment

New versions are automatically built and deployed when pushing to the `prod` branch. Use `faas-cli` if you want to deploy manually.
