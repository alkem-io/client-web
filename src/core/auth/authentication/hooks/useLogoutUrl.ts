import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from './useKratosClient';

export const useLogoutUrl = () => {
  const { t } = useTranslation();
  const client = useKratosClient();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>();
  const [logoutUrl, setLogoutUrl] = useState<string>();

  const getLogoutUrl = useCallback(async () => {
    if (!client) {
      return;
    }
    try {
      setLoading(true);
      const { status, data } = await client.createBrowserLogoutFlow();
      if (status !== 200) {
        console.error(data);
      }
      setLogoutUrl(data.logout_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('kratos.errors.session.default');
      setError(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [client, t]);

  return {
    logoutUrl,
    error,
    loading,
    getLogoutUrl: useCallback(() => getLogoutUrl(), [getLogoutUrl]),
  };
};
