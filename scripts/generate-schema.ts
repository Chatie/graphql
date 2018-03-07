#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
import * as execa from 'execa'

import { ENDPOINT } from '../'

dotenv.config()

// introspect GitHub API and save the result to `schema.json`
execa.sync('apollo-codegen', [
  'introspect-schema',
  ENDPOINT.simple,
  '--output',
  'schema.json',
  '--header',
  'Authorization: bearer ' + process.env.GC_TOKEN,
]);
console.log('schema.json generated');

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
]);
console.log('schema.ts generated');
