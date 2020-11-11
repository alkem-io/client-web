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
    }
  }
  ${USER_DETAILS_FRAGMENT}
`;

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

export const MUTATION_ADD_USER_TO_GROUP = gql`
  mutation addUserToGroup($groupID: Float!, $userID: Float!) {
    addUserToGroup(groupID: $groupID, userID: $userID)
  }
  ${GROUP_MEMBERS_FRAGMENT}
`;
