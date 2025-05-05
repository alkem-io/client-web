import { Session } from '@ory/kratos-client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from './useKratosClient';
import axios from 'axios';

export const useWhoami = () => {
  const { t } = useTranslation();
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const kratosClient = useKratosClient();

  useEffect(() => {
    if (kratosClient) {
      axios
        .get(`${kratosClient.basePath}/sessions/whoami`, { withCredentials: true })
        .then(result => {
          setIsAuthenticated(result.status === 200);
          if (result.status === 200) {
            setSession(result.data);
          } else if (result.status === 401) {
            setError(`${result.status} - ${t('kratos.errors.401')}`);
          } else {
            setError(`${result.status} - ${t('kratos.errors.session.default')}`);
          }
        })
        .catch(err => {
          setIsAuthenticated(false);
          if (err.response && err.response.status === 401) {
            setError(`${err.response.status} - ${t('kratos.errors.401')}`);
          } else {
            setError(err.message ? err.message : t('kratos.errors.session.default'));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [kratosClient, t]);

  const verified = useMemo(() => {
    return session?.identity?.verifiable_addresses?.[0].verified || false;
  }, [session]);

  return { session, loading, error, isAuthenticated, verified };
};
