import { gql } from '@apollo/client';
import { NEW_CHALLENGE_FRAGMENT } from './challenge';
import { CONTEXT_DETAL_FRAGMENT } from './context';
import { NEW_OPPORTUNITY_FRAGMENT } from './opportunity';
import { USER_DETAILS_FRAGMENT } from './user';

export const MUTATION_CREATE_USER = gql`
  mutation createUser($input: CreateUserInput!) {
    createUser(userData: $input) {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const MUTATION_UPDATE_USER = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(userData: $input) {
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
  query groupMembers($id: String!) {
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
  mutation removeUserFromGroup($input: RemoveUserGroupMemberInput!) {
    removeUserFromGroup(membershipData: $input) {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GROUP_MEMBERS_FRAGMENT}
`;

export const MUTATION_DELETE_USER = gql`
  mutation deleteUser($input: DeleteUserInput!) {
    deleteUser(deleteData: $input) {
      ...UserDetails
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

export const MUTATION_ASSIGN_USER_TO_GROUP = gql`
  mutation addUserToGroup($input: AssignUserGroupMemberInput!) {
    assignUserToGroup(membershipData: $input) {
      id
      members {
        ...GroupMembers
      }
    }
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
  mutation createChallenge($input: CreateChallengeInput!) {
    createChallenge(challengeData: $input) {
      ...NewChallenge
    }
  }
  ${NEW_CHALLENGE_FRAGMENT}
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
          ...ContextDetails
        }
      }
    }
  }
  ${CONTEXT_DETAL_FRAGMENT}
`;

export const MUTATION_CREATE_OPPORTUNITY = gql`
  mutation createOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(opportunityData: $input) {
      ...NewOpportunity
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
          ...ContextDetails
        }
      }
    }
  }
  ${CONTEXT_DETAL_FRAGMENT}
`;

export const MUTATION_CREATE_ORGANIZATION = gql`
  mutation createOrganization($input: CreateOrganisationInput!) {
    createOrganisation(organisationData: $input) {
      id
      name
    }
  }
`;

export const MUTATION_UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($input: UpdateOrganisationInput!) {
    updateOrganisation(organisationData: $input) {
      id
      name
    }
  }
`;

export const QUERY_ORGANIZATION_PROFILE_INFO = gql`
  query organisationProfileInfo($id: String!) {
    organisation(ID: $id) {
      id
      textID
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
  mutation createGroupOnCommunity($input: CreateUserGroupInput!) {
    createGroupOnCommunity(groupData: $input) {
      id
      name
    }
  }
`;

export const MUTATION_CREATE_GROUP_ON_ORGANIZATION = gql`
  mutation createGroupOnOrganization($input: CreateUserGroupInput!) {
    createGroupOnOrganisation(groupData: $input) {
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

export const MUTATION_DELETE_GROUP = gql`
  mutation removeUserGroup($input: DeleteUserGroupInput!) {
    deleteUserGroup(deleteData: $input) {
      id
    }
  }
`;
