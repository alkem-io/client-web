declare global {
  interface Window {
    _env_?: {
      REACT_APP_GRAPHQL_ENDPOINT: string | undefined;
      REACT_APP_SENTRY_ENDPOINT: string | undefined;
      REACT_APP_SENTRY_ENABLED: boolean | undefined;
      REACT_APP_SENTRY_PII_ENABLED: boolean | undefined;
      REACT_APP_NAME: string | undefined;
      REACT_APP_VERSION: string | undefined;
    };
  }
}

const env = window._env_;

export { env };
