# letsplayfootsy

## How to dev locally
```bash
docker-compose -f docker-compose.dev.yml up --build
```
Site should be live at `http://localhost`

## Login tokens
Login tokens stored through JWT stored in Cookies. To login, authenticate
through Strava. To logout, delete the `localhost` cookie `letsplayfootsy-jwt`.

## How to store secrets

- `server/secrets.yml` (gitignored, don't ever commit this!)
- `server/secrets_key.bin` (gitignored, don't ever commit this!)
```
strava_client_id: https://www.strava.com/settings/api
strava_client_secret: https://www.strava.com/settings/api

db_user: admin
db_password: 
```


# DynamoDB
We're storing oauth2 tokens in a dynamodb instance.
```
table_name: token_store
primary_key: user_name
```
