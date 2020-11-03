import { gql } from '@apollo/client';

export const QUERY_CONFIG = gql`
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
