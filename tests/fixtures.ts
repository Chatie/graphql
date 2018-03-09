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

import { LocalServer }  from '../src/local-server'

export async function* apolloFixture() {
  const localServer     = new LocalServer()
  const localEndpoints  = await localServer.endpoints()

  const wsClient = new SubscriptionClient(
    localEndpoints.subscriptions,
    {
      reconnect: true,
      timeout: 30000,
      /**
       * not accessToken ???
       * See: https://github.com/apollographql/apollo-client/blob/master/docs/source/features/subscriptions.md#authentication-over-websocket
       */
      connectionParams: {
        authToken: process.env.GC_TOKEN || null,
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
    uri: localEndpoints.simple,
    fetch,
    headers: {
      authorization: `bearer ${process.env.GC_TOKEN}`,
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

  yield apollo

  await apollo.resetStore()
  await wsClient.close()
  await localServer.reset()
}

export { NormalizedCacheObject }
