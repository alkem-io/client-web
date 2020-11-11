import { gql } from '@apollo/client';
import { USER_DETAILS_FRAGMENT } from './admin';

export const QUERY_COMMUNITY_SEARCH = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      terms
      result {
        ... on User {
          memberof {
            groups {
              name
            }
            challenges {
              name
            }
            organisations {
              name
            }
          }
          ...UserDetails
        }
        ... on UserGroup {
          name
          profile {
            avatar
            description
            references {
              name
              description
            }
            tagsets {
              name
            }
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
        challenges {
          name
        }
        organisations {
          name
        }
      }
      ...UserDetails
    }
    groups {
      __typename
      name
      members {
        name
      }
      profile {
        avatar
        description
        references {
          name
          description
        }
        tagsets {
          name
        }
      }
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;
