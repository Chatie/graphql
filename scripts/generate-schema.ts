#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

import { spawn }  from 'child_process'

import { LocalServer } from '../'

const JSON_SCHEMA_FILE  = 'downloaded-schema.json'
const TS_SCHEMA_FILE    = 'generated-schema.ts'

async function main() {
  const localServer     = new LocalServer()
  const localEndpoints  = await localServer.endpoints()

  await introspectSchema(localEndpoints.simple, JSON_SCHEMA_FILE)
  console.log(`${JSON_SCHEMA_FILE} generated`)

  await generate(JSON_SCHEMA_FILE, TS_SCHEMA_FILE)
  console.log(`${TS_SCHEMA_FILE} generated`)
}

async function introspectSchema(
  endpoint:       string,
  jsonSchemaFile: string,
) {
  // introspect GitHub API and save the result to `schema.json`
  const child = spawn('apollo-codegen', [
    'introspect-schema',
    endpoint,
    '--output',
    jsonSchemaFile,
    '--header',
    'Authorization: bearer ' + process.env.GC_TOKEN,
  ])
  child.stderr.pipe(process.stderr)
  await new Promise((resolve, reject) =>
    child.once(
      'exit',
      code => code === 0 ? resolve() : reject(code),
    ),
  )
}

async function generate(
  jsonSchemaFile: string,
  tsSchemaFile:   string,
) {
  console.log(`generating ${tsSchemaFile} from ${jsonSchemaFile}...`)
  // inpsect actual queries in `index.ts` and generate TypeScript types in `schema.ts`
  const child = spawn('apollo-codegen', [
    'generate',
    'tests/*.ts',
    '--schema',
    jsonSchemaFile,
    '--target',
    'typescript',
    '--tag-name',
    'gql',
    '--output',
    tsSchemaFile,
    '--add-typename',
  ])
  child.stderr.pipe(process.stderr)
  await new Promise((resolve, reject) =>
    child.once(
      'exit',
      code => code === 0 ? resolve() : reject(code),
    ),
  )
}

main()
.then(() => console.log('done.'))
.catch(e => {
  console.error('main cache error:', e)
  process.exit(1)
})
