#!/usr/bin/env ts-node

import * as test  from 'blue-tape'

import {
  VERSION,
}           from './config'

test('VERSION', async t => {
  const EXPECTED_REGEX = /^\d+\.\d+\.\d+$/
  t.ok(EXPECTED_REGEX.test(VERSION), 'should get semver right')
})
