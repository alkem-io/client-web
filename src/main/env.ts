declare global {
  interface Window {
    _env_?: {
      VITE_APP_ALKEMIO_DOMAIN?: string;
      VITE_APP_DEBUG_QUERY?: string;
      VITE_APP_LOG_ERRORS?: string;
      VITE_APP_IN_CONTEXT_TRANSLATION?: string;
      VITE_APP_COLLAB_URL?: string;
      VITE_APP_COLLAB_PATH?: string;
      VITE_APP_COLLAB_DOC_URL?: string;
      VITE_APP_COLLAB_DOC_PATH?: string;
    };
  }
}

const env = window._env_;

export { env };
