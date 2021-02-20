import { gql } from '@apollo/client';
import { NEW_CHALLENGE_FRAGMENT } from './challenge';
import { NEW_OPPORTUNITY_FRAGMENT } from './opportunity';
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
    removeUser(userID: $userID) {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
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

export const QUERY_ORGANIZATION_NAME = gql`
  query organizationName($id: Float!) {
    organisation(ID: $id) {
      name
    }
  }
`;

export const QUERY_ORGANIZATIONS_LIST = gql`
  query organizationsList {
    organisations {
      id
      name
    }
  }
`;

export const QUERY_CHALLENGE_NAME = gql`
  query challengeName($id: Float!) {
    challenge(ID: $id) {
      id
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

export const QUERY_ORGANIZATION_GROUPS = gql`
  query organizationGroups($id: Float!) {
    organisation(ID: $id) {
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
      id
      name
    }
  }
`;

export const QUERY_TAGSETS_TEMPLATE = gql`
  query tagsetsTemplate {
    configuration {
      template {
        users {
          tagsets {
            name
            placeholder
          }
        }
      }
    }
  }
`;

export const MUTATION_CREATE_CHALLENGE = gql`
  mutation createChallenge($challengeData: ChallengeInput!) {
    createChallenge(challengeData: $challengeData) {
      ...NewChallenge
    }
  }
  ${NEW_CHALLENGE_FRAGMENT}
`;

export const MUTATION_UPDATE_CHALLENGE = gql`
  mutation updateChallenge($challengeData: UpdateChallengeInput!) {
    updateChallenge(challengeData: $challengeData) {
      id
      name
    }
  }
`;

export const QUERY_CHALLENGE_PROFILE_INFO = gql`
  query challengeProfileInfo($id: Float!) {
    challenge(ID: $id) {
      id
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
      ...NewOpportunites
    }
  }
  ${NEW_OPPORTUNITY_FRAGMENT}
`;

export const MUTATION_UPDATE_OPPORTUNITY = gql`
  mutation updateOpportunity($opportunityData: OpportunityInput!, $ID: Float!) {
    updateOpportunity(opportunityData: $opportunityData, ID: $ID) {
      id
      name
    }
  }
`;

export const QUERY_OPPORTUNITY_PROFILE_INFO = gql`
  query opportunityProfileInfo($id: Float!) {
    opportunity(ID: $id) {
      id
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

export const MUTATION_CREATE_ORGANIZATION = gql`
  mutation createOrganization($organisationData: OrganisationInput!) {
    createOrganisation(organisationData: $organisationData) {
      id
      name
    }
  }
`;

export const MUTATION_UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($organisationData: OrganisationInput!, $orgID: Float!) {
    updateOrganisation(organisationData: $organisationData, orgID: $orgID) {
      id
      name
    }
  }
`;

export const QUERY_ORGANIZATION_PROFILE_INFO = gql`
  query organisationProfileInfo($id: Float!) {
    organisation(ID: $id) {
      id
      name
      profile {
        id
        avatar
        description
        references {
          id
          name
          uri
        }
        tagsets {
          id
          name
          tags
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

export const MUTATION_CREATE_GROUP_ON_ORGANIZATION = gql`
  mutation createGroupOnOrganization($groupName: String!, $orgID: Float!) {
    createGroupOnOrganisation(groupName: $groupName, orgID: $orgID) {
      id
      name
    }
  }
`;

export const QUERY_ORGANIZATION_DETAILS = gql`
  query organizationDetails($id: Float!) {
    organisation(ID: $id) {
      id
      name
      profile {
        id
        avatar
        description
        references {
          name
          uri
        }
        tagsets {
          id
          name
          tags
        }
      }
      groups {
        id
        name
        members {
          id
          name
        }
      }
    }
  }
`;

export const MUTATION_REMOVE_GROUP = gql`
  mutation removeUserGroup($groupId: Float!) {
    removeUserGroup(ID: $groupId)
  }
`;
