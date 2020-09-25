/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_GRAPHQL_ENDPOINT: string;
    REACT_APP_AUTHENTICATION_ENABLE: boolean;
    REACT_APP_AUTH_CLIENT_ID: string;
    REACT_APP_AUTH_TENANT_ID: string;
    REACT_APP_AUTH_API_SCOPE: string;
    REACT_APP_AUTH_REDIRECT_URI: string;
    REACT_APP_AUTH_RESOURCE_URI: string;
  }
}
