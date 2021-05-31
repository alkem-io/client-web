import axios from 'axios';
import { useEffect, useState } from 'react';

interface Result {
  identity?: {
    traits?: {
      name?: {
        last?: string;
        first?: string;
      };
      email?: string;
    };
  };
}
export const useWhoami = () => {
  const [data, setData] = useState<Result>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const headers = {
    Accept: 'application/json',
    // 'X-Session-Token': 'string',
  };

  useEffect(() => {
    axios
      .get<Result>('/sessions/whoami', {
        headers,
        withCredentials: true,
      })
      .then(result => {
        if (result.status === 200) {
          setData(result.data);
        }
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
