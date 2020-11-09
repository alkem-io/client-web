import { gql } from '@apollo/client';
import { USER_DETAILS_FRAGMENT } from './admin';

export const QUERY_COMMUNITY_SEARCH = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      result {
        ... on User {
          memberof {
            groups {
              name
            }
          }
          ...UserDetails
        }
      }
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const QUERY_COMMUNITY_USERS_LIST = gql`
  query {
    users {
      memberof {
        groups {
          name
        }
      }
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;
