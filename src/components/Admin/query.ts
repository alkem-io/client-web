import gql from 'graphql-tag';

export const QUERY_USER_LIST = gql`
  query users {
    users {
      id
      name
      email
    }
  }
`;

export const MUTATION_SAVE_USER = gql`
  mutation createUser($user: UserInput!) {
    createUser(userData: $user) {
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
