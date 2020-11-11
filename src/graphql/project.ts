import { gql } from '@apollo/client';

const PROJECT_FRAGMENT = gql`
  fragment ProjectDetails on Project {
    id
    textID
    name
    description
    state
    tagset {
      name
      tags
    }
    aspects {
      title
      framing
      explanation
    }
  }
`;

export const QUERY_PROJECT_PROFILE = gql`
  query projectProfile($id: Float!) {
    project(ID: $id) {
      ...ProjectDetails
    }
  }
  ${PROJECT_FRAGMENT}
`;

export const MUTATION_CREATE_PROJECT = gql`
  mutation createProject($opportunityID: Float!, $project: ProjectInput!) {
    createProject(opportunityID: $opportunityID, projectData: $project) {
      ...ProjectDetails
    }
  }
  ${PROJECT_FRAGMENT}
`;
