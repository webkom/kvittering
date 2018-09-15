FROM python:3.6-slim

WORKDIR /app

RUN apt-get update && apt-get install -y texlive-latex-base curl
RUN curl -sL https://github.com/openfaas/faas/releases/download/0.9.0/fwatchdog > /usr/bin/fwatchdog \
    && chmod +x /usr/bin/fwatchdog

ADD . /app

ENV fprocess="python generate.py"
CMD ["fwatchdog"]
