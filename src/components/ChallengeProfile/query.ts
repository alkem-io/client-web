import gql from 'graphql-tag';

export const QUERY_CHALLENGE_PROFILE = gql`
  query challengeProfile($id: Float!) {
    challenge(ID: $id) {
      id
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
    }
  }
`;
