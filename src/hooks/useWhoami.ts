import { Session } from '@ory/kratos-client';
import { useEffect, useMemo, useState } from 'react';
import { useKratosClient } from './useKratosClient';

export const useWhoami = () => {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const DEFAULT_ERROR_MESSAGE = "Can't get session information!";
  const kratosClient = useKratosClient();

  useEffect(() => {
    kratosClient
      .toSession()
      .then(result => {
        if (result.status === 200) {
          setSession(result.data);
          setIsAuthenticated(true);
        } else if (result.status === 401) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(false);
          setError(`${result.status} - ${DEFAULT_ERROR_MESSAGE}`);
        }
      })
      .catch(err => {
        setIsAuthenticated(false);
        if (err.request && err.request.status === 401) {
          setError(`${err.request.status} - Unauthenticated`);
          return;
        }
        setError(err.message ? err.message : DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => setLoading(false));
  }, []);

  const verified = useMemo(() => {
    return session?.identity.verifiable_addresses?.[0].verified || false;
  }, [session]);

  return { session, loading, error, isAuthenticated, verified };
};
