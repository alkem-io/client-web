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

export const MUTATION_UPDATE_CHALLENGE = gql`
  mutation updateChallenge($challengeData: ChallengeInput!, $challengeID: Float!) {
    updateChallenge(challengeData: $challengeData, challengeID: $challengeID) {
      name
    }
  }
`;

export const QUERY_CHALLENGE_PROFILE_INFO = gql`
  query challengeProfileInfo($id: Float!) {
    challenge(ID: $id) {
      textID
      name
      context {
        tagline
        background
        vision
        impact
        who
        references {
          id
          name
          uri
          description
        }
      }
    }
  }
`;

export const MUTATION_CREATE_OPPORTUNITY = gql`
  mutation createOpportunity($opportunityData: OpportunityInput!, $challengeID: Float!) {
    createOpportunityOnChallenge(opportunityData: $opportunityData, challengeID: $challengeID) {
      name
    }
  }
`;

export const MUTATION_UPDATE_OPPORTUNITY = gql`
  mutation updateOpportunity($opportunityData: OpportunityInput!, $ID: Float!) {
    updateOpportunity(opportunityData: $opportunityData, ID: $ID) {
      name
    }
  }
`;

export const QUERY_OPPORTUNITY_PROFILE_INFO = gql`
  query opportunityProfileInfo($id: Float!) {
    opportunity(ID: $id) {
      textID
      name
      context {
        tagline
        background
        vision
        impact
        who
        references {
          id
          name
          uri
          description
        }
      }
    }
  }
`;

export const MUTATION_CREATE_GROUP_ON_ECOVERSE = gql`
  mutation createGroupOnEcoverse($groupName: String!) {
    createGroupOnEcoverse(groupName: $groupName) {
      id
      name
    }
  }
`;

export const MUTATION_CREATE_GROUP_ON_CHALLENGE = gql`
  mutation createGroupOnChallenge($groupName: String!, $challengeID: Float!) {
    createGroupOnChallenge(groupName: $groupName, challengeID: $challengeID) {
      id
      name
    }
  }
`;

export const MUTATION_CREATE_GROUP_ON_OPPORTUNITY = gql`
  mutation createGroupOnOpportunity($groupName: String!, $opportunityID: Float!) {
    createGroupOnOpportunity(groupName: $groupName, opportunityID: $opportunityID) {
      id
      name
    }
  }
`;
