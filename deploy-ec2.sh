#!/bin/bash

set -ex

PROD="ec2-user@andrewho.ca"
KEYFILE="~/.ssh/stitchfix-laptop.pem"

SCP="scp -i $KEYFILE"
SSH="ssh -i $KEYFILE"

$SCP ./docker-compose.prod.yml ./nginx.prod.conf $PROD:

DC="docker-compose -f docker-compose.prod.yml"

echo "aws s3 cp s3://ca.andrewho.letsplayfootsy.encrypted/secrets.yml secrets.yml" | $SSH $PROD
echo "$DC down && $DC pull && $DC up -d" | $SSH $PROD
