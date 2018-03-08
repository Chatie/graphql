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
  'downloaded-schema.json',
  '--header',
  'Authorization: bearer ' + process.env.GC_TOKEN,
])
console.log('downloaded-schema.json generated')

// inpsect actual queries in `index.ts` and generate TypeScript types in `schema.ts`
execa.sync('apollo-codegen', [
  'generate',
  'tests/*.ts',
  '--schema',
  'downloaded-schema.json',
  '--target',
  'typescript',
  '--tag-name',
  'gql',
  '--output',
  'generated-schema.ts',
  '--add-typename',
])
console.log('generated-schema.ts generated')
