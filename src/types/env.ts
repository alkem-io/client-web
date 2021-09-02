declare global {
  interface Window {
    _env_?: {
      REACT_APP_GRAPHQL_ENDPOINT?: string;
      REACT_APP_SUBSCRIPTIONS_ENDPOINT?: string;
      REACT_APP_DEBUG_QUERY?: string;
      REACT_APP_LOG_ERRORS?: string;
    };
  }
}

const env = window._env_;

export { env };
