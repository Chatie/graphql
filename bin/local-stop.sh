#!/usr/bin/env bash
set -e

# https://github.com/drmad/tmux-git/pull/10/files
if [[ $(uname) == 'Darwin' ]]; then
  echo 'darwin'
  SCRIPT=$(greadlink -f "$0")
else
  echo 'other'
  SCRIPT=$(readlink -f "$0")
fi

# https://stackoverflow.com/a/1638397/1123955
SCRIPTPATH=$(dirname "$SCRIPT")
DIR="$( cd $SCRIPTPATH/.. && pwd )"
cd "$DIR"

echo "Working dir: $DIR"

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
touch .graphcoolrc
sed -i'.bak' '/dev: /d' .graphcoolrc
sed -i'.bak' '/default: dev/d' .graphcoolrc

echo done.
