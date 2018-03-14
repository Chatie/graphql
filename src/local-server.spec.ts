#!/usr/bin/env ts-node
import * as test from 'blue-tape'

import { LocalServer } from './local-server'

import {
  graphcoolInfoFixture,
}                       from '../tests/fixtures/'

// TODO: make reset work
test.skip('reset', async t => {
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

test('createUser', async t => {
  const rand = Math.random().toString().substr(2, 7)
  const name = `zixia-${rand}`
  const EXPECTED_EMAIL    = `${name}@zixia.net`
  const EXPECTED_NICKNAME = name
  const EXPECTED_NAME     = name

  const localServer = new LocalServer()

  const id = await localServer.createUser(
    EXPECTED_EMAIL,
    EXPECTED_NICKNAME,
    EXPECTED_NAME,
  )

  t.ok(id, 'should get user id after creation')
})

test('generateUserToken', async t => {
  const name = 'zixia-' + Math.random().toString().substr(2, 7)
  const EXPECTED_EMAIL    = `${name}@zixia.net`
  const EXPECTED_NICKNAME = name
  const EXPECTED_NAME     = name

  const localServer = new LocalServer()

  const userId = await localServer.createUser(
    EXPECTED_EMAIL,
    EXPECTED_NICKNAME,
    EXPECTED_NAME,
  )

  const token = await localServer.generateUserToken(userId)
  t.ok(token, 'should get user token after generation')
})

test('deleteAll()', async t => {
  const localServer = new LocalServer()
  const r = (Math.random()).toString().substr(2, 7)
  const name = `zixia-${r}`
  const userId = await localServer.createUser(
    `${name}@zixia.net`,
    `${name}`,
    `${name}`,
  )
  const hostie = await localServer.createHostie(
    userId,
    name,
    name,
  )
  t.ok(hostie, 'should created a hostie')
  t.ok(hostie.id, 'should created a hostie with id')

  const num = await localServer.deleteAll('Hostie')
  t.ok(num > 0, 'should delete more than one hosties')
})

test('createHostie()', async t => {
  const localServer = new LocalServer()
  const r = (Math.random()).toString().substr(2, 7)
  const name = `zixia-${r}`
  const userId = await localServer.createUser(
    `${name}@zixia.net`,
    `${name}`,
    `${name}`,
  )
  const hostie = await localServer.createHostie(
    userId,
    name,
    name,
  )
  t.ok(hostie, 'should created a hostie')
  t.ok(hostie.id, 'should created a hostie with id')
})
