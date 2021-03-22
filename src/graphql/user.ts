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
      id
      description
      avatar
      references {
        id
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
      communities {
        id
        name
        type
      }
      organisations {
        id
        name
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
  query challengeUserIds($id: String!) {
    challenge(ID: $id) {
      community {
        members {
          id
        }
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_USER_IDS = gql`
  query opportunityUserIds($id: String!) {
    opportunity(ID: $id) {
      community {
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
      id
      name
      profile {
        id
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
        communities {
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

export const MUTATION_ADD_USER_TO_COMMUNITY = gql`
  mutation addUserToCommunity($communityId: Float!, $userID: Float!) {
    addUserToCommunity(communityID: $communityId, userID: $userID) {
      id
      name
    }
  }
`;
