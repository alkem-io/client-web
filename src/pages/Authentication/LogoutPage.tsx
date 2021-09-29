import { Typography } from '@material-ui/core';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/core/Loading/Loading';
import { useKratos, useUpdateNavigation } from '../../hooks';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const { getLogoutUrl, logoutUrl, error } = useKratos();

  useEffect(() => {
    if (logoutUrl) {
      window.location.replace(logoutUrl);
      // For when the AJAX logout redirects to configured path.
      // until then use the logoutUrl.
      // axios
      //   .get(logoutUrl, {
      //     headers: {
      //       accept: 'application/json',
      //       'Content-Type': 'application/json',
      //     },
      //   })
      //   .then(_data => {
      //     window.location.replace('/');
      //   })
      //   .catch(() => {
      //     // Should not hit this. When error occur the page should be redirected to the error page.
      //     logger.error('This should not be hit!');
      //     window.location.replace('/');
      //   });
    } else {
      getLogoutUrl();
    }
    return () => {};
  }, [logoutUrl]);

  if (error) return <Typography>{error}</Typography>;
  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
