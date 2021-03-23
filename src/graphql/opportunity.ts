import { gql } from '@apollo/client';

export const QUERY_OPPORTUNITY_PROFILE = gql`
  query opportunityProfile($id: String!) {
    ecoverse {
      id
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
            id
            name
            uri
          }
        }
        community {
          groups {
            name
            members {
              name
            }
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
  query relationsList($id: String!) {
    ecoverse {
      id
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
  }
`;

export const MUTATION_UPDATE_OPPORTUNITY = gql`
  mutation updateOpportunity($opportunityData: UpdateOpportunityInput!) {
    updateOpportunity(opportunityData: $opportunityData) {
      id
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
  query opportunityActorGroups($id: String!) {
    ecoverse {
      id
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
  }
`;

export const MUTATION_UPDATE_ACTOR = gql`
  mutation updateActor($actorData: ActorInput!, $id: Float!) {
    updateActor(actorData: $actorData, ID: $id) {
      name
    }
  }
`;

export const MUTATION_REMOVE_ACTOR = gql`
  mutation removeActor($id: Float!) {
    removeActor(ID: $id)
  }
`;

export const MUTATION_RELATION_REMOVE = gql`
  mutation removeRelation($id: Float!) {
    removeRelation(ID: $id)
  }
`;

export const QUERY_OPPORTUNITY_RELATIONS = gql`
  query queryOpportunityRelations($id: String!) {
    ecoverse {
      id
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
  }
`;

export const MUTATION_UPDATE_ASPECT = gql`
  mutation updateAspect($aspectData: AspectInput!, $id: Float!) {
    updateAspect(aspectData: $aspectData, ID: $id) {
      title
    }
  }
`;

export const QUERY_OPPORTUNITY_ASPECTS = gql`
  query opportunityAspects($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        aspects {
          title
          framing
          explanation
        }
      }
    }
  }
`;
export const MUTATION_REMOVE_ASPECT = gql`
  mutation removeAspect($id: Float!) {
    removeAspect(ID: $id)
  }
`;

export const QUERY_OPPORTUNITY_TEMPLATE = gql`
  query opportunityTemplate {
    configuration {
      template {
        opportunities {
          aspects
          actorGroups
        }
      }
    }
  }
`;

export const MUTATION_CREATE_ASPECT = gql`
  mutation createAspect($aspectData: AspectInput!, $opportunityID: Float!) {
    createAspect(aspectData: $aspectData, opportunityID: $opportunityID) {
      title
    }
  }
`;

export const MUTATION_CREATE_ACTOR_GROUP = gql`
  mutation createActorGroup($actorGroupData: ActorGroupInput!, $opportunityID: Float!) {
    createActorGroup(actorGroupData: $actorGroupData, opportunityID: $opportunityID) {
      name
    }
  }
`;

export const MUTATION_REMOVE_REFERENCE = gql`
  mutation removeReference($id: Float!) {
    removeReference(ID: $id)
  }
`;

export const MUTATION_REMOVE_OPPORTUNITY = gql`
  mutation removeOpportunity($id: Float!) {
    removeOpportunity(ID: $id)
  }
`;

export const NEW_OPPORTUNITY_FRAGMENT = gql`
  fragment NewOpportunites on Opportunity {
    id
    name
  }
`;
