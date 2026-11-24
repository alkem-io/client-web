import type { Session } from '@ory/kratos-client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from './useKratosClient';

// Kratos answers whoami 403 with this id while a sign-in still owes its second
// step: not a failure of the session, just not yet a complete one.
const SESSION_AAL2_REQUIRED = 'session_aal2_required';

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
          if (err.response?.status === 403 && err.response.data?.error?.id === SESSION_AAL2_REQUIRED) {
            return;
          }
          if (err.request && err.request.status === 401) {
            setError(`${err.request.status} - ${t('kratos.errors.401')}`);
          } else {
            setError(err.message ? err.message : t('kratos.errors.session.default'));
          }
        })
        .finally(() => setLoading(false));
  }, [kratosClient, t]);

  const verified = session?.identity?.verifiable_addresses?.[0].verified || false;

  return { session, loading, error, isAuthenticated, verified };
};
