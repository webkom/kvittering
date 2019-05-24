# kaaf/kvittering
Two functions that run in OpenFaaS:

`kvittering` - frontend written in React

`kaaf` - backend written in Python

Running on https://kvittering.abakus.no (Note: only available from NTNU/eduroam)

### Getting started

Start the frontend by running `yarn start`. You can set a custom backend url by setting the `API_URL` environment variable.

To start the backend, first build the docker image with:
```
docker build -f Dockerfile.kaaf -t kaaf .
```
And then run the container with:
```
docker run --rm -p 4000:8080 kaaf
```
The container needs the environment variables `MAIL_ADDRESS` and `MAIL_PASSWORD` to be able to send the pdf after it has been generated. You can set them with the `--env` flag when running `docker run`.

To enable logging to sentry, set the `SENTRY_KEY`, `SENTRY_SECRET`, and `SENTRY_PROJECT` environment variables.

### Testing

```
docker build -t test-kaaf -f test/Dockerfile . && docker run --rm test-kaaf
```

### Deployment

New versions are automatically built and deployed when pushing to the `prod` branch. Use `faas-cli` if you want to deploy manually.
