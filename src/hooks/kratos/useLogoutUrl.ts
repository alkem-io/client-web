import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../services/logging/winston/logger';
import { useKratosClient } from './useKratosClient';

export const useLogoutUrl = () => {
  const { t } = useTranslation();
  const client = useKratosClient();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>();
  const [logoutUrl, setLogoutUrl] = useState<string>();

  const getLogoutUrl = async () => {
    if (!client) {
      return;
    }
    try {
      setLoading(true);
      const { status, data } = await client.createSelfServiceLogoutFlowUrlForBrowsers();
      if (status !== 200) {
        logger.error(data);
      }
      setLogoutUrl(data.logout_url);
    } catch (error) {
      setError(error.message ? error.message : t('kratos.errors.session.default'));
    } finally {
      setLoading(false);
    }
  };

  return {
    logoutUrl,
    error,
    loading,
    getLogoutUrl: useCallback(() => getLogoutUrl(), [client]),
  };
};
