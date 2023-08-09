import { useConfig } from '../config/useConfig';
import { env } from '../../../types/env';

const usePlatformOrigin = () => {
  const { platform, loading } = useConfig();

  if (process.env.NODE_ENV === 'development') {
    return env?.REACT_APP_ALKEMIO_DOMAIN;
  }

  if (loading) {
    return undefined;
  }

  return `https://${platform?.domain}`;
};

export default usePlatformOrigin;
