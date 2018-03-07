import * as test from 'blue-tape'

import gql                    from 'graphql-tag'
import { ApolloClient }       from 'apollo-client'
import { HttpLink }           from 'apollo-link-http'
import { InMemoryCache }      from 'apollo-cache-inmemory'
import { WebSocketLink }      from 'apollo-link-ws'
import {
  ApolloLink,
  Operation,
}                             from 'apollo-link'
import { getMainDefinition }  from 'apollo-utilities'

import * as cuid      from 'cuid'
import fetch          from 'node-fetch'
import * as WebSocket from 'ws'

import { ENDPOINT }     from '../'
import {
  AllHostiesQuery,
  CreateHostieMutation,
}                       from '../schema'

const wsLink = new WebSocketLink({
  uri: ENDPOINT.subscriptions,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: {
      accessToken: process.env.GC_TOKEN || null,
    }
  },
  webSocketImpl: WebSocket,
})

const httpLink = new HttpLink({
  uri: ENDPOINT.simple,
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

test('mutatation', async t => {
  const key     = cuid()
  const ownerId = 'cjdhklw5j0vp00110rcnftm7l'

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
  const mutationResult: CreateHostieMutation = await apollo.mutate<CreateHostieMutation>({
    mutation: gqlCreateHostie,
    variables: {
      name: key,
      ownerId,
    }
  }).then(x => x.data)
  const hostie = mutationResult.createHostie
  // console.log(hostie && hostie.name)
  t.ok(hostie, 'should return the created hostie')
  t.equal(hostie && hostie.name, key, 'should create a hostie for the specified name')
})

test('subscription', async t=> {
  t.ok('subscription')
})
