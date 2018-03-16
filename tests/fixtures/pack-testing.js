#!/usr/bin/env node

const {
  ENDPOINTS,
  VERSION,
  getApolloClient,
}                   = require('@chatie/graphql')
// }                   from '../../'

async function main() {
  const apollo = await getApolloClient('', ENDPOINTS)
  console.log(`Pack Testing v${VERSION} PASSED.`)
  return 0
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
