/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_GRAPHQL_ENDPOINT: string | undefined;
    REACT_APP_AUTHENTICATION_ENABLE: string | undefined;
    REACT_APP_AUTH_CLIENT_ID: string | undefined;
    REACT_APP_AUTH_TENANT_ID: string | undefined;
    REACT_APP_AUTH_API_SCOPE: string | undefined;
    REACT_APP_AUTH_REDIRECT_URI: string | undefined;
    REACT_APP_AUTH_RESOURCE_URI: string | undefined;
  }
}
