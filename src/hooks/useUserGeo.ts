import { useEffect, useState } from 'react';
import axios from 'axios';
import { geoEndpoint } from '../common/constants/endpoints';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<UserGeoData | undefined>();

  useEffect(() => {
    if (skip) {
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
  }, [skip]);

  return { data, loading, error };
};
