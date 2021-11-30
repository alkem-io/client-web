import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';
import { CommunityUpdatesSubscriptionContainer } from '../../../../containers/community-updates/CommunityUpdates';
import { NotificationHandler } from '../../../../containers/NotificationHandler';
import { useConfig, useNavigation, useUserContext, useUserScope } from '../../../../hooks';
import { useServerMetadataQuery } from '../../../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS, FEATURE_SUBSCRIPTIONS } from '../../../../models/constants';
import { ScrollButton } from '../../../core';
import Breadcrumbs from '../../../core/Breadcrumbs';
import Loading from '../../../core/Loading/Loading';
import TopBar from '../TopBar/TopBar';
import Footer from './Footer';
import Main from './Main';

const App = ({ children }): React.ReactElement => {
  const { t } = useTranslation();

  const { user, loading } = useUserContext();
  const { loading: configLoading, isFeatureEnabled } = useConfig();
  const { paths } = useNavigation();

  useUserScope(user);

  const { data } = useServerMetadataQuery({
    onCompleted: () => {
      console.table({
        clientName: process.env.REACT_APP_NAME,
        clientVersion: process.env.REACT_APP_VERSION,
        serverName: data?.metadata.services[0].name,
        serverVersion: data?.metadata.services[0].version,
        buildVersion: process.env.REACT_APP_BUILD_VERSION,
        buildDate: process.env.REACT_APP_BUILD_DATE,
        buildRevision: process.env.REACT_APP_BUILD_REVISION,
      });
    },
  });

  const addUpdateSubscription = (children: React.ReactNode) => {
    const communicationEnabled = isFeatureEnabled(FEATURE_COMMUNICATIONS);
    const subscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

    return communicationEnabled && subscriptionsEnabled ? (
      <CommunityUpdatesSubscriptionContainer>{children}</CommunityUpdatesSubscriptionContainer>
    ) : (
      <>{children}</>
    );
  };

  if (loading || configLoading) {
    return <Loading text={'Loading Application ...'} />;
  }

  return addUpdateSubscription(
    <div id="app">
      <div id="main">
        <TopBar />
        <Main>
          {paths.length > 0 && <Breadcrumbs paths={paths} />}
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
