#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

// TODO: deal with `errors` in the graphql query return body

import * as test from 'blue-tape'

import { ApolloClient } from 'apollo-client'
import * as cuid        from 'cuid'

import { LocalServer }  from '../src/local-server'

import {
  _ModelMutationType,
  AllHostiesQuery,
  CreateHostieMutation,
  CurrentUserQuery,
  SubscribeHostieSubscription,
}                               from '../generated-schema'

import {
  GQL_ALL_HOSTIES,
  GQL_CURRENT_USER,
  GQL_CREATE_HOSTIE,
  GQL_DELETE_HOSTIE,
  GQL_SUBSCRIBE_HOSTIE,
  GQL_UPDATE_HOSTIE,
}                           from './smoke-testing.graphql'

import {
  log,
}                           from '../'

const localServer = new LocalServer()

const currentUser = async (apollo: ApolloClient<any>) => {
  log.verbose('SmokeTesting', 'currentUser()')

  const user = await apollo.query<CurrentUserQuery>({
    query: GQL_CURRENT_USER,
  }).then(x => x.data.user)
  if (!user) {
    throw new Error('cant get current user!')
  }
  log.silly('SmokeTesting', 'currentUser() = %s', user.id)
  return user
}

test('query', async t => {
  for await (const {apollo} of localServer.fixtures()) {
    const allHosties = await apollo.query<AllHostiesQuery>({
      query: GQL_ALL_HOSTIES,
    }).then(x => x.data.allHosties)

    t.equal(allHosties.length, 0, 'query should get 0 hosties for an fresh server')
  }
})

test.skip('current user', async t => {
  for await (const {apollo} of localServer.fixtures()) {
    const user = await currentUser(apollo)
    t.ok(user, 'query should get current user')
    t.equal(user.email, 'zixia@zixia.net', 'query should get current user email')
  }
})

test('mutation/create', async t => {
  for await (const {apollo} of localServer.fixtures()) {
    const user = await currentUser(apollo)

    const name    = cuid()
    const ownerId = user.id

    const mutationResult = await apollo.mutate<CreateHostieMutation>({
      mutation: GQL_CREATE_HOSTIE,
      variables: {
        name,
        ownerId,
      },
      update: (proxy, { data }) => {
        if (!data || !data.createHostie) {
          return
        }
        const createHostie = data.createHostie

        // Read the data from our cache for this query.
        try {
          const cacheData = proxy.readQuery<AllHostiesQuery>({ query: GQL_ALL_HOSTIES })
          if (cacheData) {
            // Add our comment from the mutation to the end.
            cacheData.allHosties.push(createHostie)
            // Write our data back to the cache.
            proxy.writeQuery({ query: GQL_ALL_HOSTIES, data: cacheData })
          }
        } catch (e) {
          /// no query exist yet
        }
      },
    }).then(x => x.data)
    const hostie = mutationResult && mutationResult.createHostie
    // console.log(hostie && hostie.name)
    t.ok(hostie, 'should return the created hostie')
    t.equal(hostie && hostie.name, name, 'should create a hostie for the specified name')
  }
})

test('subscription', async t => {
  for await (const {apollo} of localServer.fixtures()) {
    const subscriptionFuture = new Promise<SubscribeHostieSubscription>((resolve, reject) => {
      // console.log('inside subscription promise')
      const hostieSubscription = apollo
      .subscribe({
        query: GQL_SUBSCRIBE_HOSTIE,
      })
      .subscribe(
        ({data}) => {
          resolve(data)
          log.silly('SmokeTesting', 'subscription: %s', JSON.stringify(data))
          hostieSubscription.unsubscribe()
          log.silly('SmokeTesting', 'subscription unsubscribed')
        },
        reject,
      )
      log.silly('SmokeTesting', 'subscribe: subscribe-ed')
    })

    // wait the subscription to ready...
    // or we might miss the following mutation event.
    // await new Promise(r => setTimeout(r, 1))
    await new Promise(r => setImmediate(r))

    const name    = cuid()
    const ownerId = (await currentUser(apollo)).id

    // console.log('mutate begin')
    await apollo.mutate<CreateHostieMutation>({
      mutation: GQL_CREATE_HOSTIE,
      variables: {
        name,
        ownerId,
      },
    })
    // console.log('mutate end')
    const changes = await subscriptionFuture
    // console.log('future done')

    t.ok(changes.Hostie, 'should receive change subscription')
    t.equal(changes.Hostie!.mutation, _ModelMutationType.CREATED, 'should receive CREATED data')
  }
})

test('watchQuery/subscribeToMore', async t => {
  for await (const {apollo} of localServer.fixtures()) {
    const hostieQuery = apollo.watchQuery<AllHostiesQuery>({
      query: GQL_ALL_HOSTIES,
    })

    hostieQuery.subscribeToMore({
      document: GQL_SUBSCRIBE_HOSTIE,
      updateQuery: (prev: { [idx: string]: any }, { subscriptionData }) => {
        const data: SubscribeHostieSubscription = subscriptionData.data
        if (!data || !data.Hostie) {
          return prev
        }

        log.silly('SmokeTesting', 'watchQuery/subscribeToMore prev: %s', JSON.stringify(prev))
        log.silly('SmokeTesting', 'watchQuery/subscribeToMore updated data: %s', JSON.stringify(data))

        let result
        const node = data.Hostie.node
        const previousValues = data.Hostie.previousValues

        switch (data.Hostie.mutation) {
          case _ModelMutationType.CREATED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties'], node],
            }
            break
          case _ModelMutationType.UPDATED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties']],
            }
            if (node) {
              for (let i = result.allHosties.length; i--;) {
                if (result.allHosties[i].id === node.id) {
                  result.allHosties[i] = node
                  break
                }
              }
            }
            break
          case _ModelMutationType.DELETED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties']],
            }
            if (previousValues) {
              for (let i = result.allHosties.length; i--;) {
                if (result.allHosties[i].id === previousValues.id) {
                  result.allHosties.splice(i, 1)
                  break
                }
              }
            }
            break
          default:
            throw new Error('unknown mutation type:' + data.Hostie.mutation)
        }

        return result
      },
    })

    const subscriptionNotifier: Function[] = []
    let subscriptionFuture: Promise<void>

    let hostieList
    const hostieSubscription = hostieQuery.subscribe(
      ({ data }) => {
        hostieList = [...data.allHosties]
        log.silly('SmokeTesting', 'watchQuery/subscribeToMore hostieList: %s', JSON.stringify(hostieList))

        while (subscriptionNotifier.length > 0) {
          const r = subscriptionNotifier.pop()!
          log.silly('SmokeTesting', 'resolving resolveNotifier...')
          r()
        }
      },
    )

    hostieList = await apollo.query<AllHostiesQuery>({
      query: GQL_ALL_HOSTIES,
    }).then(x => x.data.allHosties)
    t.equal(hostieList.length, 0, 'shoule be empty after reset')

    const ownerId = (await currentUser(apollo)).id

    subscriptionFuture = new Promise(r => subscriptionNotifier.push(r))
    const EXPECTED_NAME1 = 'a test hostie name'
    await apollo.mutate({
      mutation: GQL_CREATE_HOSTIE,
      variables: {
        name: EXPECTED_NAME1,
        ownerId,
      },
    })
    await subscriptionFuture

    t.equal(hostieList.length, 1, 'should be 1 hostie after create mutation')
    t.equal(hostieList[0].name, EXPECTED_NAME1, 'should be exactly created the hostie with EXPECTED_NAME1')

    subscriptionFuture = new Promise(r => subscriptionNotifier.push(r))
    const EXPECTED_NAME2 = 'a test hostie name 2'
    const createHostieResult = await apollo.mutate({
      mutation: GQL_CREATE_HOSTIE,
      variables: {
        name: EXPECTED_NAME2,
        ownerId,
      },
    }).then(x => x.data) as CreateHostieMutation

    await subscriptionFuture

    const createdHostie = createHostieResult.createHostie

    t.equal(hostieList.length, 2, 'should be 2 hostie after another create mutation')
    t.equal(hostieList[0].name, EXPECTED_NAME1, 'should be name1 not changed')
    t.equal(hostieList[1].id,   createdHostie && createdHostie.id, 'should match the id of new created hostie')
    t.equal(hostieList[1].name, EXPECTED_NAME2, 'should be exactly created the hostie with EXPECTED_NAME2')

    subscriptionFuture = new Promise(r => subscriptionNotifier.push(r))
    const EXPECTED_NAME3 = 'a test hostie updated name'
    await apollo.mutate({
      mutation: GQL_UPDATE_HOSTIE,
      variables: {
        id: createdHostie && createdHostie.id,
        name: EXPECTED_NAME3,
        ownerId,
      },
    })
    await subscriptionFuture

    t.equal(hostieList.length, 2, 'should be 2 hostie after another create mutation')
    t.equal(hostieList[0].name, EXPECTED_NAME1, 'should be name1 not changed')
    t.equal(hostieList[1].id,   createdHostie && createdHostie.id, 'should match the id of the updated hostie')
    t.equal(hostieList[1].name, EXPECTED_NAME3, 'should be updated with EXPECTED_NAME3')

    subscriptionFuture = new Promise(r => subscriptionNotifier.push(r))
    await apollo.mutate({
      mutation: GQL_DELETE_HOSTIE,
      variables: {
        id: createdHostie && createdHostie.id,
      },
    })
    await subscriptionFuture

    t.equal(hostieList.length, 1, 'should be 1 after delete a hostie')
    subscriptionFuture = new Promise(r => subscriptionNotifier.push(r))
    await apollo.mutate({
      mutation: GQL_DELETE_HOSTIE,
      variables: {
        id: hostieList[0].id,
      },
    })
    await subscriptionFuture

    t.equal(hostieList.length, 0, 'should be 0 after another deletion')

    hostieSubscription.unsubscribe()
  }
})
