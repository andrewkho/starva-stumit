#!/bin/bash

set -ex

cd backend
docker build -f Dockerfile.prod -t andrewkho/starva-stumit-backend:latest .
docker push andrewkho/starva-stumit-backend:latest

cd ../frontend-bs4
docker build -f Dockerfile.prod -t andrewkho/starva-stumit-frontend:latest .
docker push andrewkho/starva-stumit-frontend:latest

cd ..

