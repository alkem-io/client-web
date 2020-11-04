declare global {
  interface Window {
    _env_?: {
      REACT_APP_GRAPHQL_ENDPOINT: string | undefined;
    };
  }
}

const env = window._env_;

export { env };
