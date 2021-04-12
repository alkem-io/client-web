import { gql } from '@apollo/client';

export const GROUP_DETAILS_FRAGMENT = gql`
  fragment groupDetails on UserGroup {
    id
    name
  }
`;

export const COMMUNITY_DETAILS_FRAGMENT = gql`
  fragment CommunityDetails on Community {
    id
    name
    type
    applications {
      id
    }
    groups {
      id
      name
      members {
        id
        name
        firstName
        lastName
        email
      }
    }
  }
`;

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
        ... on Organisation {
          name
          id
        }
      }
    }
  }
`;

export const QUERY_GROUP_CARD = gql`
  query groupCard($id: String!) {
    ecoverse {
      id
      group(ID: $id) {
        __typename
        name
        parent {
          __typename
          ... on Community {
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
          id
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
  }
`;

export const QUERY_ORGANIZATION_CARD = gql`
  query organizationCard($id: String!) {
    organisation(ID: $id) {
      id
      name
      groups {
        name
      }
      members {
        id
      }
      profile {
        id
        description
        avatar
      }
    }
  }
`;
