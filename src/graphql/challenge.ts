import { gql } from '@apollo/client';

export const QUERY_CHALLENGE_PROFILE = gql`
  query challengeProfile($id: String!) {
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
        textID
        context {
          references {
            name
            uri
          }
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
`;

export const MUTATION_UPDATE_CHALLENGE_CONTEXT = gql`
  mutation updateChallengeContext($challengeData: UpdateChallengeInput!) {
    updateChallenge(challengeData: $challengeData) {
      id
      name
    }
  }
`;
// used to get list of users that can be added to an opportunity
export const QUERY_CHALLENGE_MEMBERS = gql`
  query challengeMembers($challengeID: String!) {
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
`;

export const NEW_CHALLENGE_FRAGMENT = gql`
  fragment NewChallenge on Challenge {
    id
    name
  }
`;
