/**
 * Auth0 Rule for adding Graphcool JWT to Auth0 JWT
 *
 * Credit: https://github.com/graphcool/templates/pull/77
 * README: https://github.com/kbrandwijk/functions/tree/a55a744adf2b3d10094d0d4fe0d4b3469fd1b370/authentication/auth0-rule-authentication
 *
 * NOTICE: The JavaScript engine of Auth0 Rules does not support trailing comma `,` before `}`
 *
 * Rule Docs: https://auth0.com/docs/rules/
 */

function auth0RuleGraphcool(user, context, ruleCallback) {
  // Since every Rule runs during Auth0 authentication / authorization, there's no
  // implicit way to skip a Rule. But, each login transaction reports the Client ID
  // making the request. As such, we can explicitly bail out of any Rule that is
  // meant to be associated with a specific Client ID.

  const clientIdGraphcoolTest = 'BbTTfEXSskGTja6idaSzYBBk4uuYc1lO'
  const clientIdChatie        = 'kW2jmKVAO6xMY9H4fYPUtFJSSRJbe3sz'
  if ( context.clientID !== clientIdChatie
    && context.clientID !== clientIdGraphcoolTest
  ) {
   console.log('client not match', context.clientID)
   return ruleCallback(null, user, context)
  }
  console.log(context)

  var projectId = context.clientMetadata.GRAPHCOOL_PROJECTID
  var pat       = context.clientMetadata.GRAPHCOOL_PAT1 + '.'
                + context.clientMetadata.GRAPHCOOL_PAT2 + '.'
                + context.clientMetadata.GRAPHCOOL_PAT3

  var request = require('request')

  const email = user.email
  const name  = user.name
  const login = user.username

  var getUserQuery = `query { User(email: "${email}") { id } }`

  request.post(
    {
      url: `https://api.graph.cool/simple/v1/${projectId}`,
      body: JSON.stringify({ query: getUserQuery }),
      headers: { 'Content-Type': 'application/json'}
    },
    function(err, resp, body) {
      var result = JSON.parse(body)

      if (result.data.User)
      {
        getAuthToken(result.data.User.id)
      }
      else
      {
        // Create user
        createUser(email, login, name, getAuthToken)
      }
    }
  )

  function getAuthToken(graphcoolUserId)
  {
    generateAuthToken(graphcoolUserId, function(token) {
      context.idToken['https://graph.cool/token'] = token
      /**
       * This did not work???
       * context.idToken['graph_cool_token'] = token
       */
      ruleCallback(null, user, context)
    })
  }

  function createUser(email, login, name, cb)
  {
    var createUserMutation = `
      mutation {
        createUser(
          email:  "${email}",
          login:  "${login}",
          name:   "${name}",
        ) {
          id
        }
      }
    `

    return request.post(
      {
        url: `https://api.graph.cool/simple/v1/${projectId}`,
        body: JSON.stringify({ query: createUserMutation }),
        headers: { 'Content-Type': 'application/json'},
      },
      function(err, resp, body) {
        if (err) {
          console.error(err)
        }
        cb(JSON.parse(body).data.createUser.id)
      }
    )
  }

  function generateAuthToken(userId, cb)
  {
    // TODO: set expire time for Graphcool as the same as JWT from auth0
    var generateTokenMutation = `
      mutation {
        generateNodeToken(
          input: {
            rootToken:        "${pat}",
            serviceId:        "${projectId}",
            nodeId:           "${userId}",
            modelName:        "User",
            clientMutationId: "static"
          }
        ) {
          token
        }
      }`

    return request.post(
      {
        url:      'https://api.graph.cool/system',
        body:     JSON.stringify({ query: generateTokenMutation }),
        headers: {
          'Content-Type': 'application/json',
        } ,
      },
      function(err, resp, body) {
        cb(JSON.parse(body).data.generateNodeToken.token)
      }
    )
  }

}
