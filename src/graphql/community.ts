import { gql } from '@apollo/client';

export const QUERY_COMMUNITY_SEARCH = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      terms
      result {
        ... on User {
          name
          id
        }
        ... on UserGroup {
          name
          id
        }
      }
    }
  }
`;

export const QUERY_GROUP_CARD = gql`
  query groupCard($id: Float!) {
    group(ID: $id) {
      __typename
      name
      parent {
        __typename
        ... on Challenge {
          name
        }
        ... on Ecoverse {
          name
        }
        ... on Opportunity {
          name
        }
        ... on Organisation {
          name
        }
      }
      members {
        id
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
          tags
        }
      }
    }
  }
`;
