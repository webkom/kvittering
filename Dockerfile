FROM openfaas/of-watchdog:0.7.6 as watchdog
FROM python:3.7-slim AS build-backend

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

COPY ./kaaf/req.txt ./kaaf/req.txt

RUN pip install --no-cache-dir -r kaaf/req.txt

FROM node:16-slim AS build-frontend

WORKDIR /build

COPY ./package.json ./yarn.lock ./

RUN yarn

COPY ./webapp ./webapp
COPY ./next.config.js .

# Set to production to export material ui css correctly
ENV NODE_ENV=production
RUN yarn build && yarn export

FROM build-backend

COPY ./kaaf ./kaaf
COPY ./images ./images
COPY --from=build-frontend /build/webapp/out ./static

ENV PYTHONUNBUFFERED 1

ENV STATIC_DIRECTORY /app/static

ENV mode="http"
ENV cgi_headers="true"
ENV upstream_url="http://127.0.0.1:5000"
ENV exec_timeout="40s"

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

ENV fprocess="python kaaf/server.py"
CMD ["fwatchdog"]
