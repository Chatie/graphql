#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

import * as test from 'blue-tape'

import { InMemoryCache }      from 'apollo-cache-inmemory'
import { ApolloClient }       from 'apollo-client'
import { HttpLink }           from 'apollo-link-http'
import { WebSocketLink }      from 'apollo-link-ws'
import {
  ApolloLink,
  Operation,
}                             from 'apollo-link'
import { getMainDefinition }  from 'apollo-utilities'
import gql                    from 'graphql-tag'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import * as cuid      from 'cuid'
import fetch          from 'node-fetch'
import * as WebSocket from 'ws'

import { ENDPOINTS }            from '../'
import {
  AllHostiesQuery,
  CreateHostieMutation,
  CurrentUserQuery,
  SubscribeHostieSubscription,
}                               from '../schema'

const wsClient = new SubscriptionClient(
  ENDPOINTS.subscriptions,
  {
    reconnect: true,
    timeout: 30000,
    connectionParams: {
      accessToken: process.env.GC_TOKEN || null,
    },
    // connectionCallback: (error, result) => {
    //   console.log('connection callback:', error, result)
    //   console.log('status:', wsClient.status)
    // },
  },
  WebSocket,
)

const wsClientConnected = new Promise(resolve => {
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
const httpLink = new HttpLink({
  uri: ENDPOINTS.simple,
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

test('query', async t => {
  const gqlAllHosties = gql`
    query AllHosties {
      allHosties {
        id,
        name,
        key,
        owner {
          name,
        }
      }
    }
  `

  const allHosties = await apollo.query<AllHostiesQuery>({
    query: gqlAllHosties,
  }).then(x => x.data.allHosties)

  t.ok(allHosties.length > 0, 'query should get hosties')
})

test('current user', async t => {
  const gqlCurrentUser = gql`
    query CurrentUser{
      user {
        email,
        id,
        name,
      }
    }
  `
  const currentUser = await apollo.query<CurrentUserQuery>({
    query: gqlCurrentUser,
  }).then(x => x.data.user)

  t.ok(currentUser, 'query should get current user')
  t.equal(currentUser && currentUser.email, 'zixia@zixia.net', 'query should get current user email')
})

const gqlCreateHostie = gql`
mutation CreateHostie(
  $name:    String!,
  $ownerId: ID!,
) {
  createHostie(
    key:      $name,
    name:     $name,
    ownerId:  $ownerId,
  ) {
    id,
    name,
  }
}
`

test('mutatation', async t => {
  const name    = cuid()
  const ownerId = 'cjdhklw5j0vp00110rcnftm7l'

  const mutationResult: CreateHostieMutation = await apollo.mutate<CreateHostieMutation>({
    mutation: gqlCreateHostie,
    variables: {
      name,
      ownerId,
    },
  }).then(x => x.data)
  const hostie = mutationResult.createHostie
  // console.log(hostie && hostie.name)
  t.ok(hostie, 'should return the created hostie')
  t.equal(hostie && hostie.name, name, 'should create a hostie for the specified name')
})

test('subscription', async t => {
  const gqlSubscribeHostie = gql`
    subscription SubscribeHostie{
      Hostie {
        mutation,
        node {
          id,
          key,
        },
        previousValues {
          id,
          key,
        },
      }
    }
  `
  const subscriptionFuture = new Promise<SubscribeHostieSubscription>((resolve, reject) => {
    // console.log('inside subscription promise')
    const hostieSubscription = apollo
    .subscribe({
      query: gqlSubscribeHostie,
    })
    .subscribe(
      ({data}) => {
        console.log('subscription:', JSON.stringify(data))
        hostieSubscription.unsubscribe()
        wsClient.close()
        resolve(data)
      },
      reject,
    )
    // console.log('subscribe-ed')
  })

  // await new Promise(r => setTimeout(r, 5000))
  await wsClientConnected

  const name    = cuid()
  const ownerId = 'cjdhklw5j0vp00110rcnftm7l'

  // console.log('mutate begin')
  await apollo.mutate<CreateHostieMutation>({
    mutation: gqlCreateHostie,
    variables: {
      name,
      ownerId,
    },
  })
  // console.log('mutate end')

  const changes = await subscriptionFuture

  console.log('subscription end')

  t.ok(changes.Hostie, 'should receive change subscription')
  t.equal(changes.Hostie && changes.Hostie.mutation, 'CREATED', 'should receive CREATED data')
})
