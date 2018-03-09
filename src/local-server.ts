import { spawn }  from 'child_process'

import { Endpoints }  from './config'

export class LocalServer {
  private graphcoolInfo:      string
  private graphcoolEndpoints: Endpoints

  constructor() {
    //
  }

  public async reset(): Promise<void> {
    const child = spawn('graphcool', [
      'reset',
      '-t',
      'dev',
    ])
    // child.stdout.pipe(process.stdout)
    child.stdin.write('y\n')
    // child.stdin.end()
    await new Promise(r => child.once('exit', r))
  }

  public async up(): Promise<void> {
    const child = spawn('graphcool', [
      'local',
      'up',
    ])
    // child.stdout.pipe(process.stdout)
    await new Promise(r => child.once('exit', r))
  }

  public async info(): Promise<string> {
    if (this.graphcoolInfo) {
      return this.graphcoolInfo
    }

    const child = spawn('graphcool', [
      'info',
      '-t',
      'dev',
    ])
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

    this.graphcoolInfo = output
    return output
  }

  public async endpoints(info?: string): Promise<Endpoints> {
    if (this.graphcoolEndpoints) {
      return this.graphcoolEndpoints
    }

    if (!info) {
      info = await this.info()
    }

    const REGEX = {
      relay:          /^Relay\s+(http:\/\/localhost:60000\/relay\/.+)$/m,
      simple:         /^Simple\s+(http:\/\/localhost:60000\/simple\/.+)$/m,
      subscriptions:  /^Subscriptions\s+(wss?:\/\/localhost:60000\/subscriptions\/.+)$/m,
    }

    const endpoints: Endpoints = {
      relay:          '',
      simple:         '',
      subscriptions:  '',
    }

    Object.keys(REGEX).forEach(k => {
      const match = REGEX[k].exec(info)
      if (match && match[1]) {
        endpoints[k] = match[1]
      }
    })

    this.graphcoolEndpoints = endpoints
    return endpoints
  }
}
