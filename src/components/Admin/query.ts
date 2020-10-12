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
