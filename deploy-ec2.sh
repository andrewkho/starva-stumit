#!/bin/bash

set -ex

PROD="ec2-user@$MACHINE_IP"
KEYFILE="~/.ssh/stitchfix-laptop.pem"

SCP="scp -i $KEYFILE"
SSH="ssh -i $KEYFILE"

$SCP ./docker-compose.prod.yml ./nginx.prod.conf $PROD:

DC="docker-compose -f docker-compose.prod.yml"

echo "aws s3 cp s3://ca.andrewho.letsplayfootsy.encrypted/secrets.yml secrets.yml" | $SSH $PROD
echo "aws s3 cp s3://ca.andrewho.letsplayfootsy.encrypted/private.pem private.pem" | $SSH $PROD
echo "aws s3 cp s3://ca.andrewho.letsplayfootsy.encrypted/public.pem public.pem" | $SSH $PROD
echo "yes | docker system prune -a && $DC down && $DC pull && $DC up -d" | $SSH $PROD
