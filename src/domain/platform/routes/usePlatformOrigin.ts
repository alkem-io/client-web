import { useConfig } from '../config/useConfig';
import { env } from '../../../main/env';

const usePlatformOrigin = () => {
  const { platform } = useConfig();

  if (import.meta.env.MODE === 'development') {
    return env?.VITE_APP_ALKEMIO_DOMAIN;
  }

  return platform && `https://${platform.domain}`;
};

export default usePlatformOrigin;
