FROM python:3.7-buster

WORKDIR /srv
COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000

ENTRYPOINT ["python3", "server.py"]
