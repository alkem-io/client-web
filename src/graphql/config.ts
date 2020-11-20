import { gql } from '@apollo/client';

export const QUERY_CONFIG_STRING = `
  query config {
    clientConfig {
      msalConfig {
        auth {
          authority
          clientId
          redirectUri
        }
        cache {
          cacheLocation
          storeAuthStateInCookie
        }
      }
      apiConfig {
        resourceScope
      }
      loginRequest {
        scopes
      }
      tokenRequest {
        scopes
      }
      silentRequest {
        scopes
      }
      authEnabled
    }
  }
`;

export const QUERY_CONFIG = gql`
  ${QUERY_CONFIG_STRING}
`;
