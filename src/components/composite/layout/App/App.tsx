import React, { useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';
import { NotificationHandler } from '../../../../containers/NotificationHandler';
import { useConfig, useNavigation, useUserContext, useUserScope } from '../../../../hooks';
import { ScrollButton } from '../../../core';
import Breadcrumbs from '../../../core/Breadcrumbs';
import Loading from '../../../core/Loading/Loading';
import TopBar, { TopBarSpacer } from '../TopBar/TopBar';
import Footer from './Footer';
import Main from './Main';
import useServerMetadata from '../../../../hooks/useServerMetadata';
import useCommunityUpdatesNotifier from '../../../../hooks/subscription/CommunityUpdatesNotifier';

const App = ({ children }): React.ReactElement => {
  const { t } = useTranslation();

  const { user, loading } = useUserContext();
  const { loading: configLoading } = useConfig();
  const { paths } = useNavigation();

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

  if (loading || configLoading) {
    return <Loading text={'Loading Application ...'} />;
  }

  return (
    <div id="app">
      <div id="main">
        <TopBar />
        <Main>
          <TopBarSpacer />
          {/*no point of showing just one item of the breadcrumbs*/}
          {paths.length > 1 && <Breadcrumbs paths={paths} />}
          {children}
        </Main>
        <Footer />
      </div>
      <CookieConsent
        location="bottom"
        buttonText="Ok"
        cookieName="cookie_consent"
        style={{ background: '#09bcd4', zIndex: 1500 }}
        buttonStyle={{ width: '150px', background: '#2d546a', color: '#FFFFFF', fontSize: '16px' }}
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
