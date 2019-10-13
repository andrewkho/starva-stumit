#!/bin/bash

set -ex

PROD="ec2-user@13.52.208.134"
KEYFILE="~/.ssh/stitchfix-laptop.pem"

SCP="scp -i $KEYFILE"
SSH="ssh -i $KEYFILE"

echo $SCP
echo $SSH
echo $PROD
echo $KEYFILE

$SCP ./docker-compose.prod.yml ./nginx.prod.conf $PROD:

DC="docker-compose -f docker-compose.prod.yml"
echo $DC

echo "$DC down && $DC pull && $DC up -g" | $SSH $PROD
