import { useEffect, useState } from 'react';
import axios from 'axios';

interface IpWhoIsResponse {
  ip: string;
  continent: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface UserIpData {
  ip: string;
  latitude: number;
  longitude: number;
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
      .get<IpWhoIsResponse>('http://ipwho.is/', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      })
      .then(
        x => {
          setData(x.data);
        },
        reason => {
          setError(new Error(reason));
        }
      )
      .catch(err => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [skip]);

  return { data, loading, error };
};
