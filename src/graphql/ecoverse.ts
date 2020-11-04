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
