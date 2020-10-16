import gql from 'graphql-tag';

export const QUERY_USER_LIST = gql`
  query users {
    users {
      id
      name
      firstName
      lastName
      email
      phone
      city
      country
      gender
    }
  }
`;

export const MUTATION_CREATE_USER = gql`
  mutation createUser($user: UserInput!) {
    createUser(userData: $user) {
      id
      name
      firstName
      lastName
      email
      phone
      city
      country
      gender
    }
  }
`;

export const MUTATION_UPDATE_USER = gql`
  mutation updateUser($user: UserInput!, $userId: Float!) {
    updateUser(userData: $user, userID: $userId) {
      id
      name
      firstName
      lastName
      phone
      city
      country
      gender
    }
  }
`;
