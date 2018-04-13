#!/usr/bin/env bash
set -e

sed -i'.bak' '/dev: /d' .graphcoolrc
sed -i'.bak' '/default: dev/d' .graphcoolrc
