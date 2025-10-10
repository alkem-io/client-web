import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import axios from 'axios';
import { useConfig } from '@/domain/platform/config/useConfig';

const skipOnLocal = process.env.NODE_ENV !== 'production';

interface GeoInformationResponse {
  latitude: number;
  longitude: number;
}

interface UserGeoData {
  latitude: number;
  longitude: number;
}

export interface UserGeoContextProps {
  data?: UserGeoData;
  loading: boolean;
  error: Error | undefined;
}

export const UserGeoContext = createContext<UserGeoContextProps>({
  data: undefined,
  loading: false,
  error: undefined,
});

export const UserGeoProvider = ({ children }: PropsWithChildren) => {
  const { geo } = useConfig();
  const geoEndpoint = geo?.endpoint;
  const enabled = geo?.enabled;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [data, setGeo] = useState<UserGeoData | undefined>();

  useEffect(() => {
    if (skipOnLocal || !geoEndpoint || !enabled) {
      setLoading(false);
      setGeo(undefined);
      setError(undefined);
      return;
    }

    (async () => {
      try {
        const result = await axios.get<GeoInformationResponse>(geoEndpoint);
        setGeo(result.data);
      } catch (e) {
        setError(e as Error);
      }
      setLoading(false);
    })();
  }, [skipOnLocal, geoEndpoint, enabled]);

  return <UserGeoContext value={{ data, loading, error }}>{children}</UserGeoContext>;
};
