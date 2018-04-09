import { spawn }  from 'child_process'

import Graphcool  from 'graphcool-lib'

import {
  Endpoints,
  log,
}                         from './config'
import {
  ApolloClient,
  NormalizedCacheObject,
  makeApolloClient,
}                         from './apollo'

export interface ServerFixtures {
  ENDPOINTS: Endpoints,
  ROOT: {
    token: string,
  },
  USER: {
    email:    string,
    id:       string,
    name:     string,
    nickname: string,
    token:    string,
  },
  apollo: ApolloClient<NormalizedCacheObject>,
}

export class LocalServer {
  private graphcoolInfo:      string
  private graphcoolRootToken: string
  private graphcoolLib:       Graphcool

  constructor() {
    log.verbose('LocalServer', 'constructor() __dirname=%s', __dirname)
  }

  /**
   * @deprecated not work. see issue #3
   */
  public async reset(): Promise<void> {
    log.warn('LocalServer', 'reset() WIP...')

    /**
     * method 1: not support local docker
     */
    const child = spawn('graphcool', [
      'reset',
      '-t',
      'dev',
    ], {
      cwd: __dirname,
    })

    await new Promise(r => child.once('exit', r))
    await this.up()
  }

  public async createHostie(
      ownerId:  string,
      name:     string,
      token:      string,
  ): Promise <{[key: string]: any}> {
    const lib = await this.graphcool()
    const api = lib.api('simple/v1')

    const mutationCreateHostie = `
      mutation CreateHostie {
        createHostie(
          ownerId:  "${ownerId}",
          name:     "${name}",
          token:    "${token}",
        ) {
          id
        }
      }
    `
    const result = await api.request<{
      createHostie: { id: string },
    }>(mutationCreateHostie)

    const hostie = result.createHostie
    log.silly('LocalServer', 'createHostie() new id: %s', hostie.id)
    return hostie
  }

  public async deleteAll(model: string|boolean): Promise<number> {
    log.verbose('LocalServer', 'deleteAll(model=%s)', model)

    if (typeof model === 'boolean') {
      // delete the list should in order...
      const MODEL_LIST = [
        'Giftie',
        'Botie',
        'Hostie',
        // keep User the latest
        'User',
      ]

      let counter = 0
      // delete all entries in the model in order
      for (const modelName of MODEL_LIST) {
        counter += await this.deleteAll(modelName)
      }

      return counter
    }

    const lib = await this.graphcool()
    const api = lib.api('simple/v1')

    const allItems    = `all${model}s`
    const deleteItem  = `delete${model}`

    const queryAllItems = `
      query AllItems {
        ${allItems} {
          id
        }
      }
    `
    const result = await api.request<{
      [key: string]: [{ id: string }],
    }>(queryAllItems)

    const num = result[allItems].length
    log.silly('LocalServer', 'deleteAll() get %d items for %s', num, model)

    const futureList: any[] = []

    for (const item of result[allItems]) {
      const id = item.id
      const future = api.request<{
        [key: string]: { id: string },
      }>(`
        mutation DeleteItem {
          ${deleteItem}(id: "${id}") {
            id
          }
        }
      `)
      futureList.push(future)
    }
    await Promise.all(futureList)
    log.silly('LocalServer', 'deleteAll() deleted all items for %s', model)

    return num
  }

  public async up(): Promise<void> {
    log.verbose('LocalServer', 'up()')

    const child = spawn('graphcool', [
      'local',
      'up',
    ], {
      cwd: __dirname,
    })
    // child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    await new Promise(r => child.once('exit', r))
  }

  public async info(): Promise<string> {
    log.verbose('LocalServer', 'info()')

    if (this.graphcoolInfo) {
      return this.graphcoolInfo
    }

    const child = spawn('graphcool', [
      'info',
      '-t',
      'dev',
    ], {
      cwd: __dirname,
    })
    // child.stdout.pipe(process.stdout)
    const output = await new Promise<string>((resolve, reject) => {
      let buffer = ''
      child.stdout.on('readable', () => {
        const data = child.stdout.read()
        if (data) {
          buffer += data
        }
      })
      child.stdout.on('end',    () => resolve(buffer.toString()))
      child.stdout.on('error',  reject)
    })
    await new Promise(r => child.once('exit', r))

    if (!output) {
      throw new Error('info() got nothing!')
    }
    this.graphcoolInfo = output
    log.silly('LocalServer', 'info()=%s', output)
    return output
  }

  public async endpoints(info?: string): Promise<Endpoints> {
    log.verbose('LocalServer', 'endpoints()')

    if (!info) {
      info = await this.info()
    }

    const REGEX = {
      relay:          /^Relay\s+(http:\/\/localhost:\d+\/relay\/.+)$/m,
      simple:         /^Simple\s+(http:\/\/localhost:\d+\/simple\/.+)$/m,
      subscriptions:  /^Subscriptions\s+(wss?:\/\/localhost:\d+\/subscriptions\/.+)$/m,
    }

    const endpoints: Endpoints = {
      relay:          '',
      simple:         '',
      subscriptions:  '',
      system:         'http://localhost:60000/system',  // FIXME: get from graphcool
    }

    Object.keys(REGEX).forEach(k => {
      const match = REGEX[k].exec(info)
      if (match && match[1]) {
        endpoints[k] = match[1]
      }
    })

    return endpoints
  }

  public async serviceId(info?: string): Promise<string> {
    log.verbose('LocalServer', 'serviceId()')

    if (!info) {
      info = await this.info()
    }

    const REGEX = /\s+local\/([^\s]+)\s*$/m
    const match = REGEX.exec(info)
    if (!match || !match[1]) {
      throw new Error('no project id found!')
    }
    log.silly('LocalServer', 'serviceId() = %s', match[1])
    return match[1]
  }

  public async rootToken(): Promise<string> {
    log.verbose('LocalServer', 'rootToken()')

    if (!this.graphcoolRootToken) {
      const child = spawn('graphcool', [
        'root-token',
        'local',
        '-t',
        'dev',
      ], {
        cwd: __dirname,
      })
      // child.stdout.pipe(process.stdout)
      const output = await new Promise<string>((resolve, reject) => {
        let buffer = ''
        child.stdout.on('readable', () => {
          const data = child.stdout.read()
          if (data) {
            buffer += data
          }
        })
        child.stdout.on('end',    () => resolve(buffer.toString().trim()))
        child.stdout.on('error',  reject)
      })
      await new Promise(r => child.once('exit', r))

      this.graphcoolRootToken = output
    }

    log.silly('LocalServer', 'rootToken() = %s', this.graphcoolRootToken)
    return this.graphcoolRootToken
  }

  public async graphcool() {
    log.verbose('LocalServer', 'graphcool()')

    if (!this.graphcoolLib) {
      const lib = new Graphcool(
        await this.serviceId(),
        {
          token:      await this.rootToken(),
          endpoints:  await this.endpoints(),
        },
      )
      this.graphcoolLib = lib
    }
    return this.graphcoolLib
  }

  public async generateUserToken(
      userId:               string,
      expirationInSeconds?: number,
  ): Promise<string> {
    log.verbose('LocalServer', 'generateUserToken(userId=%s, expirationInSeconds=%s)',
                                userId,
                                expirationInSeconds,
                )

    const lib   = await this.graphcool()
    const token = await lib.generateNodeToken(
      userId,
      'User',
      expirationInSeconds,
    )

    log.silly('LocalServer', 'generateUserToken() = %s', token)
    return token
  }

  public async createUser(
      email:    string,
      nickname: string,
      name?:    string,
  ): Promise<string> {
    log.verbose('LocalServer', 'createUser(email=%s, nickname=%s, name=%s)',
                                email,
                                nickname,
                                name,
                )

    const lib       = await this.graphcool()
    const api       = lib.api('simple/v1')

    const query = `
      mutation CreateUser {
        createUser(
          email: "${email}",
          nickname: "${nickname}",
          name: "${name}",
        ) {
          id
        }
      }
    `
    const result = await api.request<{
      createUser: { id: string },
    }>(query)

    log.silly('LocalServer', 'createUser() = %s', result.createUser.id)
    return result.createUser.id
  }

  public async* fixtures(): AsyncIterableIterator<ServerFixtures> {
    const randomId = Math.random()
                          .toString()
                          .substr(2, 7)

    const USER = {
      email:    `email-${randomId}@email.com`,
      nickname: `nickname-${randomId}`,
      name:     `name-${randomId}`,
      id:       '',
      token:    '',
    }

    await this.deleteAll(true)

    USER.id = await this.createUser(
      USER.email,
      USER.nickname,
      USER.name,
    )

    USER.token = await this.generateUserToken(USER.id)
    const ENDPOINTS = await this.endpoints()
    const apollo: ApolloClient<NormalizedCacheObject> = await makeApolloClient(
      USER.token,
      ENDPOINTS,
    )

    const ROOT = {
      token: await this.rootToken(),
    }
    const serverFixtures: ServerFixtures = {
      ENDPOINTS,
      ROOT,
      USER,
      apollo,
    }
    yield serverFixtures

    await this.deleteAll(true)

    await apollo.resetStore()
    apollo['wsClose']()
  }

}
