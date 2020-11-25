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
      context {
        tagline
        background
        vision
        impact
        who
        references {
          name
          uri
        }
      }
      relations {
        actorRole
        actorName
        actorType
        description
        type
      }
      actorGroups {
        id
        name
        description
        actors {
          name
          description
          value
          impact
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
  }
`;

export const MUTATION_CREATE_RELATION = gql`
  mutation createRelation($opportunityId: Float!, $relationData: RelationInput!) {
    createRelation(opportunityID: $opportunityId, relationData: $relationData) {
      id
    }
  }
`;

export const QUERY_RELATIONS_LIST = gql`
  query relationsList($id: Float!) {
    opportunity(ID: $id) {
      relations {
        id
        type
        actorName
        actorType
        actorRole
        description
      }
    }
  }
`;
