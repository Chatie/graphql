#!/usr/bin/env bash
set -e

# https://stackoverflow.com/a/1638397/1123955
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
DIR="$( cd $SCRIPTPATH/.. && pwd )"
cd "$DIR"

echo "Working dir: $DIR"

"$DIR"/bin/local-stop.sh
"$DIR"/bin/local-start.sh
