import { env } from '@/main/env';
import { useConfig } from '../config/useConfig';

const usePlatformOrigin = () => {
  const { locations } = useConfig();

  if (import.meta.env.MODE === 'development') {
    return env?.VITE_APP_ALKEMIO_DOMAIN;
  }

  return locations && `https://${locations.domain}`;
};

export default usePlatformOrigin;
