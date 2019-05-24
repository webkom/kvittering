FROM python:3.6-slim

WORKDIR /app

RUN apt-get update && apt-get install -y texlive-latex-base

ADD ./kaaf/req.txt /app
RUN pip install -r ./req.txt
ADD ./kaaf /app
ADD ./test /app

CMD ["python", "test_kaaf.py"]
