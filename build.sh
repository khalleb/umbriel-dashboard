#!/bin/sh

imageName=umbriel-dashboard
containerName=umbriel-dashboard

echo "\e[33m --> REMOVING OLD IMAGE <-- \e[0m"
docker rmi -f $imageName

echo "\e[33m --> CREATING IMAGE <-- \e[0m"
docker build -t $imageName -f Dockerfile .

echo "\e[33m --> REMOVING OLD CONTAINER <-- \e[0m"
docker rm -f $containerName

# echo "\e[33m --> CREATING CONTAINER <-- \e[0m"
docker-compose -f docker-compose-build.yml up -d