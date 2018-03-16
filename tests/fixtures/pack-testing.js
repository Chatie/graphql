#!/usr/bin/env node

import {
  ENDPOINTS,
  VERSION,
  getApolloClient,
}                   from '@chatie/graphql'
// }                   from '../../'

async function main() {
  const apollo = await getApolloClient('', ENDPOINTS)
  console.log(`PackTesting v${VERSION} passed.`)
  return 0
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
