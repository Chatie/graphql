#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

import * as execa from 'execa'

import { ENDPOINTS } from '../'

// introspect GitHub API and save the result to `schema.json`
execa.sync('apollo-codegen', [
  'introspect-schema',
  ENDPOINTS.simple,
  '--output',
  'schema.json',
  '--header',
  'Authorization: bearer ' + process.env.GC_TOKEN,
])
console.log('schema.json generated')

// inpsect actual queries in `index.ts` and generate TypeScript types in `schema.ts`
execa.sync('apollo-codegen', [
  'generate',
  'tests/*.ts',
  '--schema',
  'schema.json',
  '--target',
  'typescript',
  '--tag-name',
  'gql',
  '--output',
  'schema.ts',
  '--add-typename',
])
console.log('schema.ts generated')
