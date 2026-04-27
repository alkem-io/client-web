import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import Loading from '@/core/ui/loading/Loading';
import { PARAM_NAME_RETURN_URL } from '../constants/authentication.constants';

const LoginPage = () => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.signIn'));

  const params = useQueryParams();
  const returnUrlFromParam = params.get(PARAM_NAME_RETURN_URL) ?? undefined;
  const { returnUrl: storedReturnUrl, setReturnUrl } = useReturnUrl();
  const returnTo = returnUrlFromParam ?? storedReturnUrl ?? '/';

  useLayoutEffect(() => {
    if (returnUrlFromParam) {
      setReturnUrl(returnUrlFromParam);
    }
    const url = `/api/auth/oidc/login?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.replace(url);
  }, [returnTo, returnUrlFromParam]);

  return <Loading text={t('kratos.loading-flow')} />;
};

export default LoginPage;
