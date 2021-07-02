import { Session } from '@ory/kratos-client';
import axios from 'axios';
import { useEffect, useState } from 'react';

export const useWhoami = () => {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenitcated] = useState<boolean>(false);
  const headers = {
    Accept: 'application/json',
  };

  useEffect(() => {
    axios
      .get<Session>('/sessions/whoami', {
        headers,
        withCredentials: true,
      })
      .then(result => {
        if (result.status === 200) {
          setSession(result.data);
          setIsAuthenitcated(true);
        } else if (result.status === 401) {
          setIsAuthenitcated(false);
        }
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { session, loading, error, isAuthenticated };
};
