import { gql } from '@apollo/client';

export const QUERY_ECOVERSES_LIST = gql`
  query ecoverseList {
    name
    context {
      tagline
    }
    challenges {
      id
      name
    }
  }
`;

export const QUERY_ECOVERSE_NAME = gql`
  query ecoverseName {
    name
  }
`;

export const QUERY_ECOVERSE_DETAILS = gql`
  query ecoverseInfo {
    name
    context {
      tagline
      vision
      impact
      background
      references {
        name
        uri
      }
    }
  }
`;

export const QUERY_CHALLENGES = gql`
  query challenges {
    challenges {
      id
      name
      textID
      context {
        tagline
        references {
          name
          uri
        }
      }
    }
  }
`;

export const QUERY_PROJECTS = gql`
  query projects {
    projects {
      id
      textID
      name
      description
      state
    }
  }
`;

export const QUERY_PROJECTS_CHAIN_HISTORY = gql`
  query projectsChainHistory {
    challenges {
      name
      textID
      opportunities {
        textID
        projects {
          textID
        }
      }
    }
  }
`;

export const QUERY_OPPORTUNITIES = gql`
  query opportunities {
    opportunities {
      id
      textID
    }
  }
`;

export const QUERY_ECOVERSE_HOST_REFERENCES = gql`
  query ecoverseHostReferences {
    host {
      profile {
        references {
          name
          uri
        }
      }
    }
  }
`;
