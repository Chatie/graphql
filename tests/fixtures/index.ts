import * as fs    from 'fs'
import * as path  from 'path'

import {
  ApolloClient,
  getApolloClient,
  NormalizedCacheObject,
}                           from '../../src/apollo'
import { LocalServer }      from '../../src/local-server'

const FIXTURE_GRAPHCOOL_INFO_FILE = path.join(__dirname, 'graphcool-info.txt')

// export {
//   getApolloClient,
//   NormalizedCacheObject,
// }

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

  const apollo: ApolloClient<NormalizedCacheObject> = await getApolloClient(
    GC_USER.token,
    localEndpoints,
  )

  apollo['USER_FIXTURE'] = GC_USER
  yield apollo

  await localServer.deleteAll('User')
  await localServer.deleteAll('Hostie')

  await apollo.resetStore()
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
