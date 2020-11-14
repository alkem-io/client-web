import { gql } from '@apollo/client';
import { USER_DETAILS_FRAGMENT } from './user';

export const QUERY_COMMUNITY_SEARCH_USERS = gql`
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

export const QUERY_COMMUNITY_LIST_USERS = gql`
  query communityListUsers {
    users {
      __typename
      name
      id
    }
  }
`;

export const QUERY_GROUP_CARD = gql`
  query groupCard($id: Float!) {
    group(ID: $id) {
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
`;
