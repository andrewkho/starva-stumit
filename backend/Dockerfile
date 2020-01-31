FROM python:3.7-buster

WORKDIR /srv

RUN pip install awscli==1.16.199

COPY requirements.txt .
RUN pip install -r requirements.txt
COPY strava_swagger .

COPY . .

COPY start_local.sh .

COPY dynamodb_local/letsplayfootsy.user_refresh_tokens.json .
COPY dynamodb_local/letsplayfootsy.users.json .
COPY dynamodb_local/strava_athlete_tokens.json .

EXPOSE 8000
# ENTRYPOINT ["python3", "server.py"]

ENTRYPOINT ["/bin/bash", "start_local.sh"]
