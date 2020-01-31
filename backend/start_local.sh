#!/bin/bash

aws configure set region us-west-1
aws dynamodb create-table --cli-input-json file://letsplayfootsy.user_refresh_tokens.json --endpoint http://dynamodb:8000
aws dynamodb create-table --cli-input-json file://letsplayfootsy.users.json --endpoint http://dynamodb:8000
aws dynamodb create-table --cli-input-json file://strava_athlete_tokens.json --endpoint http://dynamodb:8000

python3 server.py
