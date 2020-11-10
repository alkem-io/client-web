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

export const QUERY_CHALLENGES = gql`
  query challenges {
    challenges {
      id
      name
      textID
    }
  }
`;

export const QUERY_ECOVERSE_DETAILS = gql`
  query ecoverseDetails {
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
      opportunities {
        id
      }
    }
  }
`;
