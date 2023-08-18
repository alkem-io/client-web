import { useEffect, useState } from 'react';
import axios from 'axios';
import { useConfig } from '../../../platform/config/useConfig';

interface GeoInformationResponse {
  latitude: number;
  longitude: number;
}

export interface UserGeoData {
  latitude: number;
  longitude: number;
}

type UseUserGeoReturnType = {
  data: UserGeoData | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const useUserGeo = (skip?: boolean): UseUserGeoReturnType => {
  const { geo } = useConfig();
  const geoEndpoint = geo?.endpoint;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<UserGeoData | undefined>();

  useEffect(() => {
    if (skip || !geoEndpoint) {
      return;
    }

    setLoading(true);
    axios
      .get<GeoInformationResponse>(geoEndpoint)
      .then(
        x => setData(x.data),
        reason => setError(new Error(reason))
      )
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [skip, geoEndpoint]);

  return { data, loading, error };
};
