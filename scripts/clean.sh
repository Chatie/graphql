#!/usr/bin/env bash
set -e

if grep -E 'dev:|default: dev' .graphcoolrc; then
  sed -i'.bak' '/dev: /d' .graphcoolrc
  sed -i'.bak' '/default: dev/d' .graphcoolrc
  echo 'Cleaned the dev settings in .graphcoolrc'
else
  echo 'Nothing tho cleaned in .graphcoolrc'
fi
