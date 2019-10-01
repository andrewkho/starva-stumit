# letsplayfootsy

## How to store secrets

- `server/secrets.yml` (gitignored, don't ever commit this!)
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
