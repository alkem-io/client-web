import { useConfig } from '../config/useConfig';
import { env } from '../../../types/env';

const usePlatformOrigin = () => {
  const { platform, loading } = useConfig();

  if (import.meta.env.MODE === 'development') {
    return env?.VITE_APP_ALKEMIO_DOMAIN;
  }

  if (loading) {
    return undefined;
  }

  return `https://${platform?.domain}`;
};

export default usePlatformOrigin;
