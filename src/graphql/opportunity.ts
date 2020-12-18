import { gql } from '@apollo/client';

export const QUERY_OPPORTUNITY_PROFILE = gql`
  query opportunityProfile($id: Float!) {
    opportunity(ID: $id) {
      id
      textID
      name
      state
      aspects {
        id
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
        id
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

export const MUTATION_CREATE_ACTOR = gql`
  mutation createActor($actorData: ActorInput!, $actorGroupID: Float!) {
    createActor(actorData: $actorData, actorGroupID: $actorGroupID) {
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

export const MUTATION_RELATION_REMOVE = gql`
  mutation removeRelation($ID: Float!) {
    removeRelation(ID: $ID)
  }
`;

export const QUERY_OPPORTUNITY_RELATIONS = gql`
  query queryOpportunityRelations($id: Float!) {
    opportunity(ID: $id) {
      relations {
        actorRole
        actorName
        actorType
        description
        type
      }
    }
  }
`;

export const MUTATION_UPDATE_ASPECT = gql`
  mutation updateAspect($aspectData: AspectInput!, $ID: Float!) {
    updateAspect(aspectData: $aspectData, ID: $ID) {
      title
    }
  }
`;

export const QUERY_OPPORTUNITY_ASPECTS = gql`
  query opportunityAspects($id: Float!) {
    opportunity(ID: $id) {
      aspects {
        title
        framing
        explanation
      }
    }
  }
`;
export const MUTATION_REMOVE_ASPECT = gql`
  mutation removeAspect($ID: Float!) {
    removeAspect(ID: $ID)
  }
`;

export const MUTATION_CREATE_ACTOR_GROUP = gql`
  mutation createActorGroup($actorGroupData: ActorGroupInput!, $opportunityID: Float!) {
    createActorGroup(actorGroupData: $actorGroupData, opportunityID: $opportunityID) {
      name
    }
  }
`;
