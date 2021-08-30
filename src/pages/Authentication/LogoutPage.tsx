import axios from 'axios';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useAuthenticationContext, useUpdateNavigation } from '../../hooks';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const { logoutUrl } = useAuthenticationContext();
  const history = useHistory();
  // const client = useKratosClient();

  // TODO [ATS]: Implement logout .... after kratos team answer questions
  useEffect(() => {
    // kratos.createSelfServiceLogoutFlowUrlForBrowsers().then(({ data }) => {
    //   if (data.logout_url) {
    //     console.log(data.logout_url);
    //     window.location.replace(data.logout_url);
    //   }
    // });

    if (logoutUrl) {
      // const token = logoutUrl.split('token=')[1];
      //  client
      //    .submitSelfServiceLogoutFlow(token)
      axios
        .get(logoutUrl, {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then(data => {
          console.log(data);
          history.replace('/');
        });
    }
    return () => {};
  }, []);

  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
