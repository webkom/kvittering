FROM python:3.6-slim

WORKDIR /app

RUN apt-get update && apt-get install -y texlive-latex-base 

ADD . /app

EXPOSE 80

CMD ["python", "generate.py"]
