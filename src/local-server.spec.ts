#!/usr/bin/env ts-node
import * as test from 'blue-tape'

import { LocalServer } from './local-server'

test('reset', async t => {
  const localServer = new LocalServer()

  await localServer.reset()
  t.ok('reset success!')
})

test('up', async t => {
  const localServer = new LocalServer()

  await localServer.up()
  t.ok('up success!')
})

test('info', async t => {
  const localServer = new LocalServer()

  const info = await localServer.info()
  t.ok(/localhost/.test(info), 'get info success!')
})

test('endpoints', async t => {
  const INFO_FIXTURE = `
API:           Endpoint:
────────────── ────────────────────────────────────────────────────────────
Simple         http://localhost:60000/simple/v1/cje8q7go30004017072lm7r5f
Relay          http://localhost:60000/relay/v1/cje8q7go30004017072lm7r5f
Subscriptions  ws://localhost:60000/subscriptions/v1/cje8q7go30004017072lm7r5f
File           http://localhost:60000/file/v1/cje8q7go30004017072lm7r5f
`
  const EXPECTED_SIMPLE = 'http://localhost:60000/simple/v1/cje8q7go30004017072lm7r5f'
  const EXPECTED_RELAY = 'http://localhost:60000/relay/v1/cje8q7go30004017072lm7r5f'
  const EXPECTED_SUBSCRIPTIONS = 'ws://localhost:60000/subscriptions/v1/cje8q7go30004017072lm7r5f'

  const localServer = new LocalServer()
  const endpoints = await localServer.endpoints(INFO_FIXTURE)

  t.equal(endpoints.simple,         EXPECTED_SIMPLE,        'should get simple endpoint')
  t.equal(endpoints.relay,          EXPECTED_RELAY,         'should get relay endpoint')
  t.equal(endpoints.subscriptions,  EXPECTED_SUBSCRIPTIONS, 'should get subscriptions endpoint')
})
