declare global {
  interface Window {
    _env_?: {
      REACT_APP_ALKEMIO_DOMAIN?: string;
      REACT_APP_DEBUG_QUERY?: string;
      REACT_APP_LOG_ERRORS?: string;
    };
  }
}

const env = window._env_;

export { env };
