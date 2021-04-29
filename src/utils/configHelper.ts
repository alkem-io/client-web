import { Configuration } from '../models/Configuration';
import { ApiConfig, Config, MsalConfig, Scope } from '../types/graphql-schema';

// For a full list of msal.js configuration parameters,

// visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
export const msalConfig: MsalConfig = {
  auth: {
    clientId: '',
    authority: '',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Coordinates and required scopes for your web api
export const apiConfig: ApiConfig = {
  resourceScope: '',
};

/**
 * Scopes you enter here will be consented once you authenticate. For a full list of available authentication parameters,
 * visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const loginRequest: Scope = {
  scopes: ['openid', 'profile', 'offline_access'],
};

// Add here scopes for access token to be used at the API endpoints.
export const tokenRequest: Scope = {
  scopes: [apiConfig.resourceScope],
};

// Add here scopes for silent token request
export const silentRequest: Scope = {
  scopes: ['openid', 'profile', apiConfig.resourceScope],
};

export const getConfig = (config?: Config): Configuration => {
  return {
    authentication: {
      ...config?.authentication,
      enabled: config?.authentication.enabled === undefined ?? false,
      providers: config?.authentication.providers || [],
    },
  };
};
