import { useEffect, useState } from 'react';
import axios from 'axios';

export interface UserIpData {
  country_code: string;
  country_name: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  IPv4: string;
  state: string;
}

type UseUserIpReturnType = {
  data: UserIpData | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const useUserIp = (skip?: boolean): UseUserIpReturnType => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<UserIpData | undefined>();

  useEffect(() => {
    if (skip) {
      return;
    }

    setLoading(true);
    axios
      .get<UserIpData>('https://geolocation-db.com/json/', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      })
      .then(
        x => {
          setData(x.data);
          return x.data;
        },
        reason => {
          setError(new Error(reason));
          return undefined;
        }
      )
      .catch(err => {
        setError(err);
        return undefined;
      })
      .finally(() => setLoading(false));
  }, [skip]);

  return { data, loading, error };
};
