import * as fs    from 'fs'
import * as path  from 'path'

import {
  InMemoryCache,
  NormalizedCacheObject,
}                             from 'apollo-cache-inmemory'
import { ApolloClient }       from 'apollo-client'
import { BatchHttpLink }      from 'apollo-link-batch-http'
import { WebSocketLink }      from 'apollo-link-ws'
import {
  ApolloLink,
  Operation,
}                             from 'apollo-link'
import { getMainDefinition }  from 'apollo-utilities'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import fetch          from 'node-fetch'
import * as WebSocket from 'ws'

import { LocalServer }      from '../../'

const FIXTURE_GRAPHCOOL_INFO_FILE = path.join(__dirname, 'graphcool-info.txt')

export async function* apolloFixture() {
  const localServer     = new LocalServer()
  const localEndpoints  = await localServer.endpoints()

  const randomId = Math.random()
                        .toString()
                        .substr(2, 7)

  const GC_USER = {
    email:    `dev-${randomId}@test.com`,
    nickname: `testuser-${randomId}`,
    name:     `Test User ${randomId}`,
    id:       '',
    token:    '',
  }

  await localServer.deleteAll('User')
  await localServer.deleteAll('Hostie')

  GC_USER.id = await localServer.createUser(
    GC_USER.email,
    GC_USER.nickname,
    GC_USER.name,
  )

  GC_USER.token = await localServer.generateUserToken(GC_USER.id)

  const apollo = await getApolloClient(
    localEndpoints.simple,
    localEndpoints.subscriptions,
    GC_USER.token,
  )

  apollo['USER_FIXTURE'] = GC_USER
  yield apollo

  await localServer.deleteAll('User')
  await localServer.deleteAll('Hostie')

  await apollo.resetStore()
  // await wsClient.close()
  apollo['wsClose']()
}

export function* graphcoolInfoFixture() {
  const EXPECTED_INFO_TEXT    = fs.readFileSync(FIXTURE_GRAPHCOOL_INFO_FILE).toString()
  const EXPECTED_ID_FROM_FILE = 'cje8q7go30004017072lm7r5f'

  yield {
    info: EXPECTED_INFO_TEXT,
    simple: `http://localhost:60000/simple/v1/${EXPECTED_ID_FROM_FILE}`,
    relay:  `http://localhost:60000/relay/v1/${EXPECTED_ID_FROM_FILE}`,
    subscriptions: `ws://localhost:60000/subscriptions/v1/${EXPECTED_ID_FROM_FILE}`,
    system: 'http://localhost:60000/system',
    serviceId: EXPECTED_ID_FROM_FILE,
  }

}

async function getApolloClient(
  simple:         string,
  subscriptions:  string,
  token:          string,
) {
  const wsClient = new SubscriptionClient(
    subscriptions,
    {
      reconnect: true,
      timeout: 30000,
      /**
       * not accessToken ???
       * See: https://github.com/apollographql/apollo-client/blob/master/docs/source/features/subscriptions.md#authentication-over-websocket
       */
      connectionParams: {
        authToken: token,
      },
      // connectionCallback: (error, result) => {
      //   console.log('connection callback:', error, result)
      //   console.log('status:', wsClient.status)
      // },
    },
    WebSocket,
  )

  const connectedFuture = new Promise(resolve => {
    wsClient.onConnected(resolve)
    wsClient.onReconnected(resolve)
  })

  // wsClient.onConnected(e => console.log('!!!on connected:', e))
  // wsClient.onConnecting(() => console.log('on connecting'))
  // wsClient.onDisconnected(e => {
  //   console.log('on disconnected:', e)
  // })
  // wsClient.onReconnected(e => console.log('on re-connected:', e))
  // wsClient.onReconnecting(e => console.log('on re-connecting:', e))

  const wsLink = new WebSocketLink(wsClient)
  const httpLink = new BatchHttpLink({
    uri: simple,
    fetch,
    headers: {
      authorization: `bearer ${token}`,
    },
  })

  const hasSubscriptionOperation = (op: Operation) => {
    const { kind, operation } = getMainDefinition(op.query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  }

  const link = ApolloLink.split(
    hasSubscriptionOperation,
    wsLink,
    httpLink,
  )
  const cache   = new InMemoryCache()
  const apollo  = new ApolloClient({
    link,
    cache,
  })

  await connectedFuture

  apollo['wsClose'] = () => wsClient.close()
  return apollo
}

export { NormalizedCacheObject }
