import { gql } from '@apollo/client';

export const QUERY_CONFIG = gql`
  query config {
    configuration {
      authentication {
        enabled
        providers {
          name
          label
          icon
          config {
            __typename
            ... on AadAuthProviderConfig {
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
            }
            ... on SimpleAuthProviderConfig {
              issuer
              tokenEndpoint
            }
          }
        }
      }
    }
  }
`;
