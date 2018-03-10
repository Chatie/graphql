#!/usr/bin/env ts-node
import * as test from 'blue-tape'

import { LocalServer } from './local-server'

import {
  graphcoolInfoFixture,
}                       from '../tests/fixtures/'

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

test('serviceId', async t => {
  for await (const INFO_FIXTURE of graphcoolInfoFixture()) {
    const localServer = new LocalServer()
    const serviceId = await localServer.serviceId(INFO_FIXTURE.info)
    t.equal(serviceId, INFO_FIXTURE.serviceId, 'should get the project id right')
  }
})

test('rootToken', async t => {
  const localServer = new LocalServer()
  const rootToken = await localServer.rootToken()
  t.ok(/^[^\s]+$/.test(rootToken), 'should get root JWT token')

  const dotNum = (rootToken.match(/\./g) || []).length
  t.equal(dotNum, 2, 'should include two dot(.)s for JWT token')
})

test.only('createUser', async t => {
  const EXPECTED_EMAIL = 'zixia@zixia.net'
  const EXPECTED_NICKNAME = 'zixia'
  const EXPECTED_NAME = 'Huan LI'

  const localServer = new LocalServer()
  await localServer.reset()

  const id = await localServer.createUser(
    EXPECTED_EMAIL,
    EXPECTED_NICKNAME,
    EXPECTED_NAME,
  )

  t.ok(id, 'should get user id after creation')
})

test('generateUserToken', async t => {
  const EXPECTED_EMAIL = 'zixia1@zixia.net'
  const EXPECTED_NICKNAME = 'zixia'
  const EXPECTED_NAME = 'Huan LI'

  const localServer = new LocalServer()

  const userId = await localServer.createUser(
    EXPECTED_EMAIL,
    EXPECTED_NICKNAME,
    EXPECTED_NAME,
  )

  const token = await localServer.generateUserToken(userId)
  t.ok(token, 'should get user token after generation')
})
