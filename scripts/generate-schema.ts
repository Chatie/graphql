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
  await new Promise(r => child.once('exit', r))
}

async function generate(
  jsonSchemaFile: string,
  tsSchemaFile:   string,
) {
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
  await new Promise(r => child.once('exit', r))
}

main()
.then(() => console.log('done.'))
.catch(e => {
  console.error(e)
  process.exit(1)
})
