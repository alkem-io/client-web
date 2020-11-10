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
        ... on UserGroup {
          name
          profile {
            avatar
          }
        }
      }
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const QUERY_COMMUNITY_LIST = gql`
  query communityList {
    users {
      __typename
      memberof {
        groups {
          name
        }
      }
      ...UserDetails
    }
    groups {
      __typename
      name
      profile {
        avatar
      }
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;
