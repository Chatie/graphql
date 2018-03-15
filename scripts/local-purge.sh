#!/usr/bin/env bash
set -e

containers=$(docker ps -f name=local_ -a -q)
if [ ! -z "$containers" ]; then
  docker stop $containers
  docker rm $containers
  docker volume rm $(docker volume ls -q -f dangling=true -f name=local_)
  sed -i'.bak' '/dev: /d' .graphcoolrc
fi
