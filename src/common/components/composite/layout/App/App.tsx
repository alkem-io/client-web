import React, { FC, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationHandler } from '../../../../../core/notifications/NotificationHandler';
import { useApm, useUserContext, useUserScope } from '../../../../../hooks';
import useServerMetadata from '../../../../../domain/platform/metadata/useServerMetadata';
import useCommunityUpdatesNotifier from '../../../../../hooks/subscription/CommunityUpdatesNotifier';
import { useCookies } from 'react-cookie';
import { ALKEMIO_COOKIE_NAME } from '../../../../../domain/platform/cookies/useAlkemioCookies';
import CookieConsent from '../../../../../domain/platform/cookies/CookieConsent';

const App: FC = () => {
  const [cookies] = useCookies([ALKEMIO_COOKIE_NAME]);
  const { user } = useUserContext();

  useUserScope(user);
  useCommunityUpdatesNotifier();

  useApm();

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
      <Outlet />
      {!cookies.accepted_cookies && <CookieConsent />}
      <NotificationHandler />
    </>
  );
};

export default App;
