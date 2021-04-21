import { gql } from '@apollo/client';
import { COMMUNITY_DETAILS_FRAGMENT } from './community';

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
          id
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
  mutation createRelation($input: CreateRelationInput!) {
    createRelation(relationData: $input) {
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
  mutation createActor($input: CreateActorInput!) {
    createActor(actorData: $input) {
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
  mutation updateActor($input: UpdateActorInput!) {
    updateActor(actorData: $input) {
      id
      name
    }
  }
`;

export const MUTATION_REMOVE_ACTOR = gql`
  mutation removeActor($input: DeleteActorInput!) {
    deleteActor(deleteData: $input) {
      id
    }
  }
`;

export const MUTATION_RELATION_REMOVE = gql`
  mutation removeRelation($input: DeleteRelationInput!) {
    deleteRelation(deleteData: $input) {
      id
    }
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
  mutation updateAspect($input: UpdateAspectInput!) {
    updateAspect(aspectData: $input) {
      id
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
  mutation removeAspect($input: DeleteAspectInput!) {
    deleteAspect(deleteData: $input) {
      id
    }
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
  mutation createAspect($input: CreateAspectInput!) {
    createAspect(aspectData: $input) {
      title
    }
  }
`;

export const MUTATION_CREATE_ACTOR_GROUP = gql`
  mutation createActorGroup($input: CreateActorGroupInput!) {
    createActorGroup(actorGroupData: $input) {
      name
    }
  }
`;

export const MUTATION_DELETE_REFERENCE = gql`
  mutation removeReference($input: DeleteReferenceInput!) {
    deleteReference(deleteData: $input) {
      id
    }
  }
`;

export const MUTATION_REMOVE_OPPORTUNITY = gql`
  mutation removeOpportunity($input: DeleteOpportunityInput!) {
    deleteOpportunity(deleteData: $input) {
      id
    }
  }
`;

export const NEW_OPPORTUNITY_FRAGMENT = gql`
  fragment NewOpportunity on Opportunity {
    id
    name
  }
`;

export const QUERY_OPPORTUNITY_COMMUNITY = gql`
  query opportunityCommunity($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
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
