import { Session } from '@ory/kratos-client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from './useKratosClient';

export const useWhoami = () => {
  const { t } = useTranslation();
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const kratosClient = useKratosClient();

  useEffect(() => {
    if (kratosClient)
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
            setError(`${result.status} - ${t('kratos.errors.session.default')}`);
          }
        })
        .catch(err => {
          setIsAuthenticated(false);
          if (err.request && err.request.status === 401) {
            setError(`${err.request.status} - Unauthenticated`);
            return;
          }
          setError(err.message ? err.message : t('kratos.errors.session.default'));
        })
        .finally(() => setLoading(false));
  }, [kratosClient]);

  const verified = useMemo(() => {
    return session?.identity.verifiable_addresses?.[0].verified || false;
  }, [session]);

  return { session, loading, error, isAuthenticated, verified };
};
