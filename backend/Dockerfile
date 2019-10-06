FROM python:3.7-buster

WORKDIR /srv

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
ENTRYPOINT ["python3", "server.py"]
