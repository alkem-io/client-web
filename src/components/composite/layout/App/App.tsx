import { useSelector } from '@xstate/react';
import React, { useRef } from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CommunityUpdatesSubscriptionContainer } from '../../../../containers/community-updates/CommunityUpdates';
import { NotificationHandler } from '../../../../containers/NotificationHandler';
import {
  useAuthenticationContext,
  useConfig,
  useNavigation,
  useUserContext,
  useUserScope,
  useGlobalState,
} from '../../../../hooks';
import { useServerMetadataQuery } from '../../../../hooks/generated/graphql';
import {
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  FEATURE_COMMUNICATIONS,
  FEATURE_SUBSCRIPTIONS,
} from '../../../../models/constants';
import { ScrollButton } from '../../../core';
import Breadcrumbs from '../../../core/Breadcrumbs';
import Button from '../../../core/Button';
import Loading from '../../../core/Loading/Loading';
import Section from '../../../core/Section';
import UserSegment from '../../entities/User/UserSegment';
import Footer from './Footer';
import Header from './Header';
import Main from './Main';

const App = ({ children }): React.ReactElement => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();

  const { user, loading, verified } = useUserContext();
  const { loading: configLoading, isFeatureEnabled } = useConfig();
  const { paths } = useNavigation();
  const {
    ui: { loginNavigationService, userSegmentService },
  } = useGlobalState();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  const headerRef = useRef<HTMLElement>(null);

  const isUserSegmentVisible = useSelector(userSegmentService, state => {
    return state.matches('visible');
  });

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
        <Header innerRef={headerRef}>
          {isVisible => (
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexGrow: 1 }} />
              {loginVisible && (
                <>
                  {!isAuthenticated && (
                    <Button
                      as={Link}
                      to={AUTH_LOGIN_PATH}
                      text={t('authentication.sign-in')}
                      style={{ marginLeft: 20 }}
                      small
                      variant="primary"
                    />
                  )}
                  {!isAuthenticated && (
                    <Button
                      as={Link}
                      to={AUTH_REGISTER_PATH}
                      text={t('authentication.sign-up')}
                      style={{ marginLeft: 20 }}
                      small
                    />
                  )}
                </>
              )}
              {isUserSegmentVisible && user && (
                <UserSegment
                  userMetadata={user}
                  orientation={isVisible ? 'vertical' : 'horizontal'}
                  emailVerified={verified}
                />
              )}
            </div>
          )}
        </Header>
        <Main>
          {paths.length > 0 && (
            <Section
              hideDetails
              gutters={{ content: false, details: false, root: true }}
              classes={{
                padding: '0',
              }}
            >
              <Breadcrumbs paths={paths} />
            </Section>
          )}
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
