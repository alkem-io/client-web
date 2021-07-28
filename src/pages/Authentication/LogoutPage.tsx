import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/core/Loading/Loading';
import { useUpdateNavigation } from '../../hooks';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  useEffect(() => {
    window.location.replace('/self-service/browser/flows/logout');
    return () => {};
  }, []);

  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
