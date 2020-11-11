import { gql } from '@apollo/client';

export const QUERY_CHALLENGE_PROFILE = gql`
  query challengeProfile($id: Float!) {
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
          name
          uri
          description
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
        projects {
          id
          textID
          name
          description
          state
        }
      }
    }
  }
`;
