#!/usr/bin/env bash
set -e

echo "Stoping docker containers & delete it with all volumes..."
containers=$(docker ps -f name=local_ -a -q)
if [ ! -z "$containers" ]; then
  docker stop $containers
  docker rm $containers
  docker volume rm $(docker volume ls -q -f dangling=true -f name=local_)
fi
echo done.

echo "Removing all generated schemas..."
rm -fv downloaded-schema.json generated-schema.ts
echo done.

echo "Removing local/dev setting in .graphcoolrc..."
sed -i'.bak' '/dev: /d' .graphcoolrc
echo done.
