FROM python:3.9-slim AS build-backend

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY ./pyproject.toml ./pyproject.toml

RUN pip install poetry

RUN set -e \
  && poetry config virtualenvs.create false \
  && poetry install --without dev

FROM node:18-slim AS build-frontend

WORKDIR /build

COPY ./package.json ./yarn.lock ./

RUN yarn

ENV NODE_ENV=production

COPY ./webapp ./webapp

COPY ./next.config.js .

COPY ./tailwind.config.js .
COPY ./postcss.config.js .

RUN yarn build && yarn export

FROM build-backend

COPY ./server ./server
COPY ./images ./images
COPY --from=build-frontend /build/webapp/out ./static

# Ensures python output is sent straight to terminal without being first buffered
ENV PYTHONUNBUFFERED 1

# Set static dir to webapp
ENV STATIC_DIRECTORY /app/static

ENTRYPOINT ["python", "server/server.py"]

