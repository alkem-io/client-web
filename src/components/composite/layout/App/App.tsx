import React, { FC, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationHandler } from '../../../../containers/NotificationHandler';
import { useUserContext, useUserScope } from '../../../../hooks';
import { ScrollButton } from '../../../core';
import TopBar, { TopBarSpacer } from '../TopBar/TopBar';
import Footer from './Footer';
import Main from './Main';
import useServerMetadata from '../../../../hooks/useServerMetadata';
import useCommunityUpdatesNotifier from '../../../../hooks/subscription/CommunityUpdatesNotifier';
import CookieConsent from '../../../../domain/cookies/CookieConsent';
import { useCookies } from 'react-cookie';
import { COOKIE_NAME } from '../../../../domain/cookies/useAlkemioCookies';
import PlatformUpdates from '../../../../domain/notifications/ReleaseUpdates/ReleaseUpdatesNotification';

const App: FC = () => {
  const [cookies] = useCookies([COOKIE_NAME]);
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
    <>
      <div id="main">
        <TopBar />
        <Main>
          <TopBarSpacer />
          <PlatformUpdates />
          <Outlet />
        </Main>
        <Footer />
      </div>
      {!cookies.accepted_cookies && <CookieConsent />}
      <ScrollButton />
      <NotificationHandler />
    </>
  );
};

export default App;
