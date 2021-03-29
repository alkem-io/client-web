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
  query ecoverse {
    ecoverse {
      id
      name
      community {
        groups {
          id
          name
        }
      }
      challenges {
        id
        name
        textID
        community {
          groups {
            id
            name
          }
        }
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
    ecoverse {
      id
      group(ID: $id) {
        id
        name
        members {
          ...GroupMembers
        }
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
    ecoverse {
      id
      challenges {
        id
        name
        community {
          id
          name
        }
      }
    }
  }
`;

export const QUERY_ECOVERSE_GROUPS_LIST = gql`
  query ecoverseGroupsList {
    ecoverse {
      id
      groups {
        id
        name
      }
    }
  }
`;

export const QUERY_ORGANIZATION_NAME = gql`
  query organizationName($id: String!) {
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
  query challengeName($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        name
        community {
          id
          name
        }
      }
    }
  }
`;

export const QUERY_CHALLENGE_GROUPS = gql`
  query challengeGroups($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

export const QUERY_ORGANIZATION_GROUPS = gql`
  query organizationGroups($id: String!) {
    organisation(ID: $id) {
      groups {
        id
        name
      }
    }
  }
`;

export const QUERY_CHALLENGE_OPPORTUNITIES = gql`
  query challengeOpportunities($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        opportunities {
          id
          name
        }
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_GROUPS = gql`
  query opportunityGroups($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

export const QUERY_OPPORTUNITY_NAME = gql`
  query opportunityName($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        id
        name
      }
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
  query challengeProfileInfo($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        textID
        name
        state
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
  }
`;

export const MUTATION_CREATE_OPPORTUNITY = gql`
  mutation createOpportunity($opportunityData: OpportunityInput!) {
    createOpportunity(opportunityData: $opportunityData) {
      ...NewOpportunites
    }
  }
  ${NEW_OPPORTUNITY_FRAGMENT}
`;

export const MUTATION_UPDATE_OPPORTUNITY = gql`
  mutation updateOpportunity($opportunityData: UpdateOpportunityInput!) {
    updateOpportunity(opportunityData: $opportunityData) {
      id
      name
    }
  }
`;

export const QUERY_OPPORTUNITY_PROFILE_INFO = gql`
  query opportunityProfileInfo($id: String!) {
    ecoverse {
      id
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
  mutation updateOrganization($organisationData: UpdateOrganisationInput!) {
    updateOrganisation(organisationData: $organisationData) {
      id
      name
    }
  }
`;

export const QUERY_ORGANIZATION_PROFILE_INFO = gql`
  query organisationProfileInfo($id: String!) {
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

export const MUTATION_CREATE_GROUP_ON_COMMUNITY = gql`
  mutation createGroupOnCommunity($communityID: Float!, $groupName: String!) {
    createGroupOnCommunity(communityID: $communityID, groupName: $groupName) {
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
  query organizationDetails($id: String!) {
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
