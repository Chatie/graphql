import {
  InMemoryCache,
  NormalizedCacheObject,
}                             from 'apollo-cache-inmemory'
import {
  ApolloClient,
  MutationUpdaterFn,
  ObservableQuery,
}                             from 'apollo-client'
import {
  ApolloLink,
  Operation,
}                             from 'apollo-link'
import { BatchHttpLink }      from 'apollo-link-batch-http'
import { WebSocketLink }      from 'apollo-link-ws'
import { getMainDefinition }  from 'apollo-utilities'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import fetch          from 'cross-fetch'
import * as WebSocket from 'isomorphic-ws'
import {
  ENDPOINTS,
  Endpoints,
  log,
}                     from './config'

export async function makeApolloClient(
  token:      string,
  endpoints:  Endpoints = ENDPOINTS,
) {
  log.verbose('Apollo', 'getApolloClient(token=%s, endpoints=%s)',
                        token,
                        JSON.stringify(endpoints),
              )
  // let wsConnectionCallback: Function[] = []
  // const wsConnectionFuture = new Promise((resolve, reject) => {
  //   wsConnectionCallback = [resolve, reject]
  // })

  const wsClient = new SubscriptionClient(
    endpoints.subscriptions,
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
      //   if (error) {
      //     wsConnectionCallback[1](error)
      //   } else {
      //     wsConnectionCallback[0](result)
      //   }
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
    uri: endpoints.simple,
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
  log.silly('Apollo', 'getApolloClient() connected')

  apollo['wsClose'] = () => wsClient.close()
  return apollo
}

export {
  ApolloClient,
  MutationUpdaterFn,
  NormalizedCacheObject,
  ObservableQuery,
}
