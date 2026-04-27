import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useIdTokenHint } from './useIdTokenHint';

export const useLogoutUrl = () => {
  const { t } = useTranslation();
  const { fetchIdTokenHint } = useIdTokenHint();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>();
  const [logoutUrl, setLogoutUrl] = useState<string>();

  const getLogoutUrl = async () => {
    try {
      setLoading(true);
      const idToken = await fetchIdTokenHint();
      const postLogoutRedirectUri = `${window.location.origin}${AUTH_LOGOUT_PATH}`;
      const params = new URLSearchParams({
        id_token_hint: idToken,
        post_logout_redirect_uri: postLogoutRedirectUri,
      });
      setLogoutUrl(`/api/auth/oidc/logout?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('kratos.errors.session.default');
      setError(new Error(message));
    } finally {
      setLoading(false);
    }
  };

  return {
    logoutUrl,
    error,
    loading,
    getLogoutUrl: () => getLogoutUrl(),
  };
};
