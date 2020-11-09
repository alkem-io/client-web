import { gql } from '@apollo/client';

export const QUERY_OPPORTUNITY_PROFILE = gql`
  query opportunityProfile($id: Float!) {
    opportunity(ID: $id) {
      id
      textID
      name
      state
      aspects {
        title
        framing
        explanation
      }
      profile {
        description
        avatar
        references {
          name
          uri
          description
        }
      }
      actorGroups {
        id
        name
        description
        actors {
          name,
          description,
          value,
          impact
        }
      }
    }
  }
`;
