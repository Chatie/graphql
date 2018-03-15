#!/usr/bin/env bash
set -e

docker stop $(docker ps -f name=local_ -a -q)
docker rm $(docker ps -f name=local_ -a -q)
docker volume rm $(docker volume ls -q -f dangling=true -f name=local_)

sed -i '/dev: /d' .graphcoolrc
