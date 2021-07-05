import { Session } from '@ory/kratos-client';
import axios from 'axios';
import { useEffect, useState } from 'react';

export const useWhoami = () => {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const headers = {
    Accept: 'application/json',
  };
  const DEFAULT_ERROR_MESSAGE = "Can't get session information!";
  useEffect(() => {
    axios
      .get<Session>('/sessions/whoami', {
        headers,
        withCredentials: true,
      })
      .then(result => {
        if (result.status === 200) {
          setSession(result.data);
          setIsAuthenticated(true);
        } else if (result.status === 401) {
          setIsAuthenticated(false);
        } else {
          setError(`${result.status} - ${DEFAULT_ERROR_MESSAGE}`);
        }
      })
      .catch(err => {
        setError(err.message ? err.message : DEFAULT_ERROR_MESSAGE);
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return { session, loading, error, isAuthenticated };
};
