#!/usr/bin/env bash
set -e

echo 'graphcool local up...'
graphcool local up
echo 'done.'

echo 'graphcool deploy...'
graphcool deploy -c local -n chatie -t dev
echo 'done.'

echo 'generate-schema...'
ts-node scripts/generate-schema
echo 'done.'
