import { gql } from '@apollo/client';

export const QUERY_CONFIG = gql`
  query config {
    configuration {
      authenticationProviders {
        name
        label
        icon
        config {
          __typename
          ... on AadConfig {
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
          ... on SimpleAuthProviderConfig {
            issuer
            tokenEndpoint
          }
        }
      }
    }
  }
`;
