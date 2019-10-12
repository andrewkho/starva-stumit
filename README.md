# letsplayfootsy

Thinking of calling this wonky project "Starva Samit".

It uses Sanic backend, React + bootstrap frontend, with nginx reverse-proxy.
DynamoDB is in the back end to store some encrypted tokens and map user_ids
(stored in JWT) to athlete_ids. Plan is to deploy this as single instance 
EC2 with an encrypted S3 bucket for secrets.

## How to dev locally
```bash
docker-compose -f docker-compose.dev.yml up --build
```
Site should be live at `http://localhost`

## Strava Swagger client
To regenerate the swagger client (it isn't regenerated in docker image):
```bash
swagger-codegen generate \
-i https://developers.strava.com/swagger/swagger.json \
-l python \
-o strava_swagger \
-c strava_swagger.json 

# In your environment, if you want to dev locally
cd strava_swagger
pip install .
cd ..
```

## Login tokens
Login tokens stored through JWT stored in Cookies. To login, authenticate
through Strava. To logout, delete the `localhost` cookie `letsplayfootsy-jwt`.

jwt secret is in `secrets.yml` under key `jwt_secret`

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
Right now we're authing through personal account. For local developoment,
creds are stored in `secrets.yml` under the keys `aws_access_key` and 
`aws_secret_access_key`


# EC2 container setup
Spin up container through UI
```
ssh -i ~/.ssh/<keyfile>.pem ec2-user@<public dns>

# In remote machine
sudo su -
amazon-linux-extras install docker
yum install -y git docker 
service docker start
usermod -a -G docker ec2-user
chkconfig docker on
reboot

# install docker-compose
curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose version
```

# Git clone and build
```
# ssh into machine as ec2-user
git clone https://github.com/andrewkho/letsplayfootsy.git
cd letsplayfootsy
docker-compose -f docker-compose.prod.yml up --build

```
