import { gql } from '@apollo/client';
import { USER_DETAILS_FRAGMENT } from './user';

export const MUTATION_CREATE_USER = gql`
  mutation createUser($user: UserInput!) {
    createUser(userData: $user) {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const MUTATION_UPDATE_USER = gql`
  mutation updateUser($user: UserInput!, $userId: Float!) {
    updateUser(userData: $user, userID: $userId) {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const QUERY_ECOVERSE_GROUPS = gql`
  query ecoverseChallengeGroups {
    name
    groups {
      id
      name
    }
    challenges {
      id
      name
      textID
      groups {
        id
        name
      }
    }
  }
`;

export const GROUP_MEMBERS_FRAGMENT = gql`
  fragment GroupMembers on User {
    id
    name
    firstName
    lastName
    email
  }
`;

export const QUERY_GROUP_MEMBERS = gql`
  query groupMembers($id: Float!) {
    group(ID: $id) {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GROUP_MEMBERS_FRAGMENT}
`;

export const MUTATION_REMOVE_USER_FROM_GROUP = gql`
  mutation removeUserFromGroup($groupID: Float!, $userID: Float!) {
    removeUserFromGroup(groupID: $groupID, userID: $userID) {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GROUP_MEMBERS_FRAGMENT}
`;

export const MUTATION_REMOVE_USER = gql`
  mutation removeUser($userID: Float!) {
    removeUser(userID: $userID)
  }
`;

export const MUTATION_ADD_USER_TO_GROUP = gql`
  mutation addUserToGroup($groupID: Float!, $userID: Float!) {
    addUserToGroup(groupID: $groupID, userID: $userID)
  }
  ${GROUP_MEMBERS_FRAGMENT}
`;

export const QUERY_ECOVERSE_CHALLENGES_LIST = gql`
  query ecoverseChallengesList {
    challenges {
      id
      name
    }
  }
`;

export const QUERY_ECOVERSE_GROUPS_LIST = gql`
  query ecoverseGroupsList {
    groups {
      id
      name
    }
  }
`;

export const QUERY_CHALLENGE_NAME = gql`
  query challengeName($id: Float!) {
    challenge(ID: $id) {
      name
    }
  }
`;

export const QUERY_CHALLENGE_GROUPS = gql`
  query challengeGroups($id: Float!) {
    challenge(ID: $id) {
      groups {
        id
        name
      }
    }
  }
`;

export const QUERY_CHALLENGE_OPPORTUNITIES = gql`
  query challengeOpportunities($id: Float!) {
    challenge(ID: $id) {
      opportunities {
        id
        name
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_GROUPS = gql`
  query opportunityGroups($id: Float!) {
    opportunity(ID: $id) {
      groups {
        id
        name
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_NAME = gql`
  query opportunityName($id: Float!) {
    opportunity(ID: $id) {
      name
    }
  }
`;

export const QUERY_TAGSETS_TEMPLATE = gql`
  query tagsetsTemplate {
    configuration {
      template {
        users {
          tagsets
        }
      }
    }
  }
`;

export const MUTATION_CREATE_CHALLENGE = gql`
  mutation createChallenge($challengeData: ChallengeInput!) {
    createChallenge(challengeData: $challengeData) {
      name
    }
  }
`;
