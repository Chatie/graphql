#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

import { spawn }  from 'child_process'

import {
  log,
}               from '../src/config'
import {
  LocalServer,
}               from '../src/local-server'

const JSON_SCHEMA_FILE  = 'downloaded-schema.json'
const TS_SCHEMA_FILE    = 'generated-schema.ts'

async function main() {
  log.verbose('GenerateSchema', 'main()')

  const localServer     = new LocalServer()
  const localEndpoints  = await localServer.endpoints()

  log.silly('GenerateSchema', 'main() simple endpoint: %s', localEndpoints.simple)

  await introspectSchema(localEndpoints.simple, JSON_SCHEMA_FILE)
  console.log(`${JSON_SCHEMA_FILE} generated`)

  await generate(JSON_SCHEMA_FILE, TS_SCHEMA_FILE)
  console.log(`${TS_SCHEMA_FILE} generated`)
}

async function introspectSchema(
  endpoint:       string,
  jsonSchemaFile: string,
) {
  log.verbose('GenerateSchema', 'introspectSchema(endpoint=%s, jsonSchemaFile=%s)',
                                endpoint,
                                jsonSchemaFile,
              )
  // introspect GitHub API and save the result to `schema.json`
  const child = spawn('apollo-codegen', [
    'introspect-schema',
    endpoint,
    '--output',
    jsonSchemaFile,
    '--header',
    'Authorization: bearer ' + process.env.GRAPHCOOL_ROOT_TOKEN,
  ], {
    stdio: 'inherit',
  })
  // child.stderr.pipe(process.stderr)
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
  log.verbose('GenerateSchema', 'generate(jsonSchemaFile: %s, tsSchemaFile: %s)',
                                jsonSchemaFile,
                                tsSchemaFile,
              )
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
  ], {
    stdio: 'inherit',
  })
  // child.stderr.pipe(process.stderr)
  await new Promise((resolve, reject) =>
    child.once(
      'exit',
      code => code === 0 ? resolve() : reject(code),
    ),
  )
}

main()
.then(() => log.verbose('GenerateSchema', 'SUCCEED!'))
.catch(e => {
  log.error('GenerateSchema', 'ERROR: %s', e)
  process.exit(1)
})
