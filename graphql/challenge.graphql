import { gql } from '@apollo/client';
import { COMMUNITY_DETAILS_FRAGMENT } from './community';
import { CONTEXT_DETAL_FRAGMENT } from './context';

export const QUERY_CHALLENGE_PROFILE = gql`
  query challengeProfile($id: String!) {
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
        community {
          members {
            name
          }
        }

        tagset {
          name
          tags
        }
        opportunities {
          id
          name
          state
          textID
          context {
            ...ContextDetails
          }
          projects {
            id
            textID
            name
            description
            state
          }
        }
        leadOrganisations {
          id
          name
          profile {
            id
            avatar
          }
        }
      }
    }
  }
  ${CONTEXT_DETAL_FRAGMENT}
`;

export const MUTATION_UPDATE_CHALLENGE = gql`
  mutation updateChallenge($input: UpdateChallengeInput!) {
    updateChallenge(challengeData: $input) {
      id
      name
    }
  }
`;
// used to get list of users that can be added to an opportunity
export const QUERY_CHALLENGE_MEMBERS = gql`
  query challengeMembers($challengeID: String!) {
    ecoverse {
      id
      challenge(ID: $challengeID) {
        community {
          members {
            id
            name
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

export const NEW_CHALLENGE_FRAGMENT = gql`
  fragment NewChallenge on Challenge {
    id
    name
  }
`;

export const QUERY_CHALLENGE_COMMUNITY = gql`
  query challengeCommunity($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        name
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${COMMUNITY_DETAILS_FRAGMENT}
`;
