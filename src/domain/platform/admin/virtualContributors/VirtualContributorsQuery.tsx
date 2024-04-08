import { gql } from '@apollo/client';

export const GET_VIRTUAL_CONTRIBUTORS = gql`
  query VirtualContributors {
    virtualContributors {
      id
      nameID
      profile {
        displayName
      }
    }
  }
`;
