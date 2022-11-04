import { useEffect, useState } from 'react';
import axios from 'axios';

export interface UserIpData {
  country_code: string; // "BG",
  country_name: string; // "Bulgaria",
  city: string; // "Varna",
  postal: string; // "9000",
  latitude: number; // 43.2167,
  longitude: number; // 27.9167,
  IPv4: string; // "88.203.192.145",
  state: string; // "Varna"
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
