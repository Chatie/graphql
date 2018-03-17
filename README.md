# GRAPHQL

[![npm version](https://badge.fury.io/js/%40chatie%2Fgraphql.svg)](https://www.npmjs.com/package/@chatie/graphql)
[![Build Status](https://travis-ci.org/Chatie/graphql.svg?branch=master)](https://travis-ci.org/Chatie/graphql)
[![Greenkeeper badge](https://badges.greenkeeper.io/Chatie/graphql.svg)](https://greenkeeper.io/)

Chatie GraphQL Schema & Settings & Development Fixtures

> `@chatie/graphql` is a system module for https://www.chatie.io

## Develop

```shell
npm install
npm run gc:login
npm run gc:deploy
npm run gc:playground
```

## Deploy Development Server

### 1. Start a local server

```shell
$ npm gc:local:start
# or
$ chatie-graphql-local-start
```

### 2. Stop the local server

```shell
$ npm gc:local:stop
# or
$ chatie-graphql-local-stop
```

## Test

```shell
npm test
```

# GRAPHQL SCHEMA

1. See: `/graphcool.yml`
1. See: `/types/*.graphql`

# API

## `LocalServer` Class

Provide local server managing tools, unit testing helper functions and fixtures.

# RESOURCES

1. [An introduction to Graphcool framework](https://hackernoon.com/graphcool-framework-analysis-and-its-use-case-319173a9aea4)
1. [GraphQL Schema Language Cheat Sheet](https://github.com/sogko/graphql-schema-language-cheat-sheet)
1. [watchQuery + Subscriptions](https://alligator.io/angular/graphql-subscriptions/)
1. [Introducing GraphQL Subscriptions](https://blog.graph.cool/introducing-graphql-subscriptions-86183029029a)

## Background Knoweledge

1. [The Fullstack Tutorial for GraphQL](https://www.howtographql.com)
1. [Zero to GraphQL in 30 Minutes – Steven Luscher](https://www.youtube.com/watch?v=UBGzsb2UkeY)
1. [Angular + Apollo Tutorial - Introduction](https://www.howtographql.com/angular-apollo/0-introduction/)

## Code & Tools

1. [auth0-rule-authentication for GraphCool](https://github.com/kbrandwijk/functions/tree/a55a744adf2b3d10094d0d4fe0d4b3469fd1b370/authentication/auth0-rule-authentication)

## Strong Typing for TypeScript

1. gpl2ts: [GraphQL + Typescript: Strongly Typed API Responses](https://medium.com/@brettjurgens/graphql-typescript-strongly-typed-api-responses-f8aea1e81b93)
1. graphql-code-generator: [GraphQL Code-Generator 1.0](https://medium.com/@dotansimha/graphql-code-generator-a34e3785e6fb)
1. apollo-codegen: [Apollo GraphQL code generator](https://github.com/apollographql/apollo-codegen)
1. quicktype: [Build better apps faster by generating types from data.](https://quicktype.io)
1. [Apollo Client + TypeScript example](https://medium.com/@borekb/apollo-client-typescript-example-99febdaa18fa)

## NPM Scoped Module

* [publishing scoped module](https://github.com/npm/npm/issues/12194#issuecomment-279226735)

# SERVERLESS GRAPHQL

`@chatie/graphql` is using the Graph.Cool service.

Learn more about Graph Backend as a Service: GraphCool - https://graph.cool

# AUTHOR

[Huan LI](http://linkedin.com/in/zixia) \<zixia@zixia.net\>

<a href="https://stackexchange.com/users/265499">
  <img src="https://stackexchange.com/users/flair/265499.png" width="208" height="58" alt="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites">
</a>

# COPYRIGHT & LICENSE

* Code & Docs © 2017-2018 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
