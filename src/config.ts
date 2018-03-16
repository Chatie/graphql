import * as readPkgUp from 'read-pkg-up'

import { log }   from 'brolog'
log.level(process.env['BROLOG_LEVEL'] as any)

import { Endpoints } from 'graphcool-lib/dist/src/types'

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator')

// export interface Endpoints {
//   simple:         string,
//   system:         string,
//   relay:          string,
//   subscriptions:  string,
// }

/**
 * Here are your GraphQL Endpoints:
 */
export const ENDPOINTS: Endpoints = {
  simple: 'https://api.graph.cool/simple/v1/chatie',
  system: 'https://api.graph.cool/system',
  relay:  'https://api.graph.cool/relay/v1/chatie',
  subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/chatie',
  // simple: 'https://api.graph.cool/simple/v1/cjdbw710k0zpr0129sv35o79e',
  // relay:  'https://api.graph.cool/relay/v1/cjdbw710k0zpr0129sv35o79e',
  // subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/cjdbw710k0zpr0129sv35o79e',
}

export const STAGING_ENDPOINTS: Endpoints = {
  simple: 'https://api.graph.cool/simple/v1/chatie-staging',
  system: 'https://api.graph.cool/system',
  relay:  'https://api.graph.cool/relay/v1/chatie-staging',
  subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/chatie-staging',
}

const pkg = readPkgUp.sync({ cwd: __dirname }).pkg
export const VERSION = pkg.version

export {
  Endpoints,
  log,
}
