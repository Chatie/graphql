#!/usr/bin/env bash
set -e

# https://stackoverflow.com/a/1638397/1123955
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
DIR="$( cd $SCRIPTPATH/.. && pwd )"
cd "$DIR"

echo "Working dir: $DIR"

echo "Removing local/dev setting in .graphcoolrc..."
sed -i'.bak' '/dev: /d' .graphcoolrc
echo done.

echo 'graphcool local up...'
graphcool local up
echo 'done.'

echo 'graphcool deploy...'
graphcool deploy -c local -n chatie -t dev
echo 'done.'
