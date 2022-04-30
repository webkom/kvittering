FROM python:3.9-slim AS build-backend

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY ./server/requirements/ ./server/requirements/

RUN pip install --no-cache-dir -r server/requirements/prod.txt

FROM node:18-slim AS build-frontend

WORKDIR /build

COPY ./package.json ./yarn.lock ./

RUN yarn

COPY ./webapp ./webapp

COPY ./next.config.js .

# Set to production to export material ui css correctly
ENV NODE_ENV=production

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

