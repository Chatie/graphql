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

"$DIR"/bin/local-stop.sh
"$DIR"/bin/local-start.sh
