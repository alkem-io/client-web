declare global {
  interface Window {
    _env_?: {
      REACT_APP_GRAPHQL_ENDPOINT?: string;
      REACT_APP_SENTRY_ENDPOINT?: string;
      REACT_APP_SENTRY_ENABLED?: string;
      REACT_APP_SENTRY_PII_ENABLED?: string;
      REACT_APP_NAME?: string;
      REACT_APP_VERSION?: string;
      REACT_APP_FEEDBACK_URL?: string;
      REACT_APP_DEBUG_QUERY?: string;
      REACT_APP_LOG_ERRORS?: string;
    };
  }
}

const env = window._env_;

export { env };
