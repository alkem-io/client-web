import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';

const LogoutPage = () => {
  const { t } = useTranslation();

  const { getLogoutUrl, logoutUrl, error } = useLogoutUrl();

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
  }, [logoutUrl, getLogoutUrl]);

  if (error)
    return (
      <Typography>
        <>{error}</>
      </Typography>
    );
  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
