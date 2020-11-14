import { gql } from '@apollo/client';

export const USER_DETAILS_FRAGMENT = gql`
  fragment UserDetails on User {
    id
    name
    firstName
    lastName
    email
    gender
    country
    city
    phone
    accountUpn
    profile {
      description
      avatar
      references {
        name
        uri
      }
      tagsets {
        name
        tags
      }
    }
  }
`;

export const USER_MEMBER_OF_FRAGMENT = gql`
  fragment UserMembers on User {
    memberof {
      groups {
        id
        name
      }
      challenges {
        id
        name
        textID
      }
    }
  }
`;

export const QUERY_USER_LIST = gql`
  query users {
    users {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const QUERY_USER = gql`
  query user($id: String!) {
    user(ID: $id) {
      ...UserDetails
      ...UserMembers
    }
  }
  ${USER_DETAILS_FRAGMENT}
  ${USER_MEMBER_OF_FRAGMENT}
`;

export const QUERY_ECOVERSE_USER_IDS = gql`
  query ecoverseUserIds {
    users {
      id
    }
  }
`;

export const QUERY_CHALLENGE_USER_IDS = gql`
  query challengeUserIds($id: Float!) {
    challenge(ID: $id) {
      contributors {
        id
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_USER_IDS = gql`
  query opportunityUserIds($id: Float!) {
    opportunity(ID: $id) {
      groups {
        members {
          id
        }
      }
    }
  }
`;

export const QUERY_USER_AVATARS = gql`
  query userAvatars($ids: [String!]!) {
    usersById(IDs: $ids) {
      profile {
        avatar
      }
    }
  }
`;

export const QUERY_USER_PROFILE = gql`
  # Write your query or mutation here
  query userProfile {
    me {
      ...UserDetails
      ...UserMembers
    }
  }
  ${USER_DETAILS_FRAGMENT}
  ${USER_MEMBER_OF_FRAGMENT}
`;

export const QUERY_USER_CARD = gql`
  query userCardData($ids: [String!]!) {
    usersById(IDs: $ids) {
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
  }
`;
