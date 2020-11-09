import { gql } from '@apollo/client';
import { USER_DETAILS_FRAGMENT } from './admin';

export const QUERY_COMMUNITY_SEARCH = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      result {
        ... on User {
          ...UserDetails
        }
      }
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;
