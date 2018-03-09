import gql from 'graphql-tag'

export const GQL_CURRENT_USER = gql`
  query CurrentUser{
    user {
      email,
      id,
      name,
    }
  }
`

export const GQL_ALL_HOSTIES = gql`
  query AllHosties {
    allHosties {
      id,
      name,
      key,
      owner {
        name,
      }
    }
  }
`

export const GQL_CREATE_HOSTIE = gql`
  mutation CreateHostie(
    $name:    String!,
    $ownerId: ID!,
  ) {
    createHostie(
      key:      $name,
      name:     $name,
      ownerId:  $ownerId,
    ) {
      id,
      name,
    }
  }
`

export const GQL_DELETE_HOSTIE = gql`
  mutation DeleteHostie($id: ID!) {
    deleteHostie(id: $id) {
      id
    }
  }
`

export const GQL_UPDATE_HOSTIE = gql`
  mutation UpdateHostie(
    $id: ID!,
    $name: String,
  ) {
    updateHostie(
      id:   $id
      name: $name
    ) {
      id,
      name,
    }
  }
`

export const GQL_SUBSCRIBE_HOSTIE = gql`
  subscription SubscribeHostie{
    Hostie {
      mutation,
      node {
        id,
        name,
        key,
        owner {
          name,
        },
      },
      previousValues {
        id,
        key,
      },
    }
  }
`

export const GQL_CREATE_USER = gql`
  mutation(
    $email:     String!,
    $nickname:  String!,
    $name:      String,
  ) {
    createUser(
      email:    $email,
      nickname: $nickname,
      name:     $name,
    ) {
      id
    }
  }
`

export const GQL_GENERATE_USER_TOKEN = gql`
  mutation GenerateUserToken(
    $pat:       String!,
    $projectId: String!,
    $userId:    ID!,
  ) {
    generateUserToken(
      input: {
        pat:              $pat,
        projectId:        $projectId,
        userId:           $userId,
        modelName:        "User",
        clientMutationId: "static"
      }
    ) {
      token
    }
  }
`
