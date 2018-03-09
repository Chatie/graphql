#!/usr/bin/env ts-node
import * as test from 'blue-tape'

import { LocalServer } from './local-server'

import { graphcoolInfoFixture }  from '../tests/fixtures/'

test('reset', async t => {
  const localServer = new LocalServer()

  await localServer.reset()
  t.pass('reset success!')
})

test('up', async t => {
  const localServer = new LocalServer()

  await localServer.up()
  t.pass('up success!')
})

test('info', async t => {
  const localServer = new LocalServer()

  const info = await localServer.info()
  t.ok(/localhost/.test(info), 'get info success!')
})

test('endpoints', async t => {
  for await (const INFO_FIXTURE of graphcoolInfoFixture()) {
    const localServer = new LocalServer()
    const endpoints = await localServer.endpoints(INFO_FIXTURE.info)

    t.equal(endpoints.simple,         INFO_FIXTURE.simple,        'should get simple endpoint')
    t.equal(endpoints.relay,          INFO_FIXTURE.relay,         'should get relay endpoint')
    t.equal(endpoints.subscriptions,  INFO_FIXTURE.subscriptions, 'should get subscriptions endpoint')
  }
})

test('projectId', async t => {
  for await (const INFO_FIXTURE of graphcoolInfoFixture()) {
    const localServer = new LocalServer()
    const projectId = await localServer.projectId(INFO_FIXTURE.info)
    t.equal(projectId, INFO_FIXTURE.projectId, 'should get the project id right')
  }
})

test('rootToken', async t => {
  const localServer = new LocalServer()
  const rootToken = await localServer.rootToken()
  t.ok(/^[^\s]+$/.test(rootToken), 'should get root JWT token')

  const dotNum = (rootToken.match(/\./g) || []).length
  t.equal(dotNum, 2, 'should include two dot(.)s for JWT token')
})
