/**
 * Here are your GraphQL Endpoints:
 */

export interface Endpoints {
  simple:         string,
  relay:          string,
  subscriptions:  string,
}

export const ENDPOINTS: Endpoints = {
  simple: 'https://api.graph.cool/simple/v1/cjdbw710k0zpr0129sv35o79e',
  relay:  'https://api.graph.cool/relay/v1/cjdbw710k0zpr0129sv35o79e',
  subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/cjdbw710k0zpr0129sv35o79e',
}

export const LOCAL_ENDPOINT: Endpoints = {
  simple: 'https://api.graph.cool/simple/v1/cjdbw710k0zpr0129sv35o79e',
  relay:  'https://api.graph.cool/relay/v1/cjdbw710k0zpr0129sv35o79e',
  subscriptions:  'wss://subscriptions.ap-northeast-1.graph.cool/v1/cjdbw710k0zpr0129sv35o79e',
}
