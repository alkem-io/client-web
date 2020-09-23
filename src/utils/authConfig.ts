// For a full list of msal.js configuration parameters,
// visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AUTH_TENANT_ID}`,
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Coordinates and required scopes for your web api
export const apiConfig = {
  resourceUri: 'http://localhost:4000/api/profile',
  resourceScope: process.env.REACT_APP_AUTH_API_SCOPE || '',
};

/**
 * Scopes you enter here will be consented once you authenticate. For a full list of available authentication parameters,
 * visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
};

// Add here scopes for access token to be used at the API endpoints.
export const tokenRequest = {
  scopes: [apiConfig.resourceScope],
};

// Add here scopes for silent token request
export const silentRequest = {
  scopes: ['openid', 'profile', apiConfig.resourceScope],
};
