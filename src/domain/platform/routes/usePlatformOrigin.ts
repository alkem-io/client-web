import { useContext } from 'react';
import { env } from '@/main/env';
import { useConfig } from '../config/useConfig';
import { PlatformOriginContext } from './PlatformOriginContext';

const usePlatformOrigin = () => {
  const { locations } = useConfig();
  const suppliedOrigin = useContext(PlatformOriginContext);

  if (suppliedOrigin !== undefined) {
    return suppliedOrigin;
  }

  if (import.meta.env.MODE === 'development') {
    return env?.VITE_APP_ALKEMIO_DOMAIN;
  }

  return locations && `https://${locations.domain}`;
};

export default usePlatformOrigin;
