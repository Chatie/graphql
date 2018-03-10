import { Brolog }   from 'brolog'
/**
 * Here are your GraphQL Endpoints:
 */
import { Endpoints } from 'graphcool-lib/dist/src/types'

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator')

// export interface Endpoints {
//   simple:         string,
//   system:         string,
//   relay:          string,
//   subscriptions:  string,
// }

export const ENDPOINTS: Endpoints = {
  simple: 'https://api.graph.cool/simple/v1/cjdbw710k0zpr0129sv35o79e',
  system: 'https://api.graph.cool/system',
  relay:  'https://api.graph.cool/relay/v1/cjdbw710k0zpr0129sv35o79e',
  subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/cjdbw710k0zpr0129sv35o79e',
}

export const log = new Brolog()
if (process.env['BROLOG_LEVEL']) {
  log.level(process.env['BROLOG_LEVEL'] as any)
}

export {
  Endpoints,
}
