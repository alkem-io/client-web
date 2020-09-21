// For a full list of msal.js configuration parameters,
// visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
export const msalConfig = {
  auth: {
    clientId: '279502ba-5997-4c74-896d-c229c02f4dad',
    authority: 'https://login.microsoftonline.com/2570f136-86fa-4ec4-b18d-cb07a1755e35',
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
  resourceScope: 'api://1400d97a-a25d-46e7-8d67-a67cbe2f4fb2/.default',
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
