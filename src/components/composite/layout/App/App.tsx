import React, { FC, useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import { NotificationHandler } from '../../../../containers/NotificationHandler';
import { useNavigation, useUserContext, useUserScope } from '../../../../hooks';
import { ScrollButton } from '../../../core';
import Breadcrumbs from '../../../core/Breadcrumbs';
import TopBar, { TopBarSpacer } from '../TopBar/TopBar';
import Footer from './Footer';
import Main from './Main';
import useServerMetadata from '../../../../hooks/useServerMetadata';
import useCommunityUpdatesNotifier from '../../../../hooks/subscription/CommunityUpdatesNotifier';

const App: FC = () => {
  const { t } = useTranslation();
  const { paths } = useNavigation();
  const theme = useTheme();

  const { user } = useUserContext();

  useUserScope(user);
  useCommunityUpdatesNotifier();

  const { services } = useServerMetadata();

  useEffect(() => {
    if (services.length) {
      console.table({
        clientName: process.env.REACT_APP_NAME,
        clientVersion: process.env.REACT_APP_VERSION,
        serverName: services[0].name,
        serverVersion: services[0].version,
        buildVersion: process.env.REACT_APP_BUILD_VERSION,
        buildDate: process.env.REACT_APP_BUILD_DATE,
        buildRevision: process.env.REACT_APP_BUILD_REVISION,
      });
    }
  }, [services]);

  return (
    <div id="app">
      <div id="main">
        <TopBar />
        <Main>
          <TopBarSpacer />
          {/* no point of showing just one item of the breadcrumbs */}
          {paths.length > 1 && <Breadcrumbs paths={paths} />}
          <Outlet />
        </Main>
        <Footer />
      </div>
      <CookieConsent
        location="bottom"
        buttonText={t('buttons.ok')}
        cookieName="cookie_consent"
        style={{
          background: theme.palette.primary.main,
          fontFamily: theme.typography.fontFamily,
          zIndex: 1500,
        }}
        buttonStyle={{
          width: '150px',
          color: '#FFFFFF',
          background: theme.palette.primary.dark,
          borderRadius: theme.shape.borderRadius,
          ...theme.typography.button,
        }}
        expires={150}
      >
        {t('cookie.consent')}
      </CookieConsent>
      <ScrollButton />
      <NotificationHandler />
    </div>
  );
};

export default App;
