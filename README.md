# letsplayfootsy

Thinking of calling this wonky project "Starva Samit".

It uses Sanic backend, React + bootstrap frontend, with nginx reverse-proxy.
DynamoDB is in the back end to store some encrypted tokens and map user_ids
(stored in JWT) to athlete_ids. Plan is to deploy this as single instance 
EC2 with an encrypted S3 bucket for secrets.

## How to dev locally
First create your `secrets.yml` file (see "How to store secrets" below)
Then: 
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

## To re-download the Tom Tom js SDK
We use version 4.47.6 in this build. Create an account to get an API key
and get the SDK from here:
https://developer.tomtom.com/maps-sdk-web/downloads

## Login tokens
Login tokens stored through JWT stored in Cookies. To login, authenticate
through Strava. To logout, delete the `localhost` cookie `letsplayfootsy-jwt`.

jwt secret is in `secrets.yml` under key `jwt_secret`

## How to store secrets

- `server/secrets.yml` (gitignored, don't ever commit this!)
- For local development
  - You'll need to generate your own `strava_client_{id,secret}`. 
  - Generate any UUID (no dashes) to use as the `jwt_secret` and `strava_token_key`
```
strava_client_id: https://www.strava.com/settings/api
strava_client_secret: https://www.strava.com/settings/api

jwt_secret: <Generate your own UUID>
strava_token_key: <Generate your own UUID>
```

## DynamoDB
We're storing oauth2 tokens in a dynamodb instance.
```
table_name: token_store
primary_key: user_name
```
Right now we're authing through personal account. For local developoment,
creds are stored in `secrets.yml` under the keys `aws_access_key` and 
`aws_secret_access_key`


# EC2 container setup
Spin up container through UI, setup Elastic IP and assign to instance.
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

# Deploying to production
~We're using a webhook in github on master branch that will kick off~
~a build of `andrewkho/starva-stumit-backend` and~
~`andrewkho/starva-stumit-frontend` in dockerhub.~
We're storing images in dockerhub: `andrewkho/starva-stumit-backend` and
`andrewkho/strava-stumit-frontend`.

# Pre-deploy script
You can run this script from the project root which will build and push 
to dockerhub.
```bash
./pre-deploy.sh
```

### Build and push to dockerhub manually
Or run these commands to do it manually
```
cd backend
docker build -t andrewkho/starva-stumit-backend:latest .
docker push andrewkho/starva-stumit-backend:latest

cd ../frontend-bs4
docker build -f Dockerfile.prod -t andrewkho/starva-stumit-frontend:latest .
docker push andrewkho/starva-stumit-frontend:latest
```

### Testing the prod build locally
You can test locally with:
```
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up
```

## Deploying to EC2
This script copies necessary config to ec2, and then docker-compose pull
and docker-compose up in the remote machine. REQUIRES SSH KEY!
```
MACHINE_IP=xxx.xxx.xxx.xxx ./deploy-to-ec2.sh
```


## Cloudflare
We're using Cloudflare to proxy traffic to the EC2 instance. Cloudflare 
enforces https for all traffic, and page-rules to redirect non-www to www.
 
Specifically, we use cloudflare to enforce https for all client to edge 
traffic, and we needed to setup https for our origin server to encrypt 
proxy -> origin traffic. Certs are Origin certs from 
`cloudflare -> ssl/tls -> origin server -> origin certificates`. 
These are only valid through cloudflare proxy.
Certs are stored in encrypted s3 and copied to the server on deploy.


## Login creds 
All usernames are UUIDs generated whenever a client authenticates with Strava.
The username is stored in a JWT by the browser through the `Set-Cookie` 
directive. Clients can log out by deleting the cookie. They will be assigned
a new username upon relogging in.
