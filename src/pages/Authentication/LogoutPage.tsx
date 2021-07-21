import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/core/Loading';
import { useKratosClient } from '../../hooks/useKratosClient';
import { useUpdateNavigation } from '../../hooks/useNavigation';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const kratos = useKratosClient();

  useEffect(() => {
    kratos.createSelfServiceLogoutFlowUrlForBrowsers().then(({ data }) => {
      if (data.logout_url) {
        console.log(data.logout_url);
        // window.location.replace(data.logout_url);
      }
    });
    return () => {};
  }, []);

  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
