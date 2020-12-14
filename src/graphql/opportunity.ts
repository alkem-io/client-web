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
      groups {
        name
        members {
          name
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
          id
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

export const MUTATION_UPDATE_OPPORTUNITY_CONTEXT = gql`
  mutation updateOpportunityContext($opportunityID: Float!, $opportunityData: OpportunityInput!) {
    updateOpportunity(ID: $opportunityID, opportunityData: $opportunityData) {
      name
    }
  }
`;
export const MUTATION_ADD_USER_TO_OPPORTUNITY = gql`
  mutation addUserToOpportunity($opportunityID: Float!, $userID: Float!) {
    addUserToOpportunity(opportunityID: $opportunityID, userID: $userID) {
      name
    }
  }
`;

export const QUERY_OPPORTUNITY_ACTOR_GROUPS = gql`
  query opportunityActorGroups($id: Float!) {
    opportunity(ID: $id) {
      actorGroups {
        id
        name
        description
        actors {
          id
          name
          description
          value
          impact
        }
      }
    }
  }
`;

export const MUTATION_UPDATE_ACTOR = gql`
  mutation updateActor($actorData: ActorInput!, $ID: Float!) {
    updateActor(actorData: $actorData, ID: $ID) {
      name
    }
  }
`;

export const MUTATION_REMOVE_ACTOR = gql`
  mutation removeActor($ID: Float!) {
    removeActor(ID: $ID)
  }
`;
