import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationHandler } from '@/core/ui/notifications/NotificationHandler';
import { useUserContext } from '@/domain/community/user';
import { useUserScope } from '@/core/analytics/SentryTransactionScopeContext';
import useServerMetadata from '@/domain/platform/metadata/useServerMetadata';
import { useCookies } from 'react-cookie';
import { ALKEMIO_COOKIE_NAME } from '@/main/cookies/useAlkemioCookies';
import CookieConsent from '@/main/cookies/CookieConsent';
import { Box } from '@mui/material';

const App = () => {
  const [cookies] = useCookies([ALKEMIO_COOKIE_NAME]);
  const { user } = useUserContext();

  useUserScope(user);

  const { services } = useServerMetadata();

  useEffect(() => {
    if (services.length) {
      console.table({
        clientName: import.meta.env.VITE_APP_NAME,
        clientVersion: import.meta.env.VITE_APP_VERSION,
        serverName: services[0].name,
        serverVersion: services[0].version,
        buildVersion: import.meta.env.VITE_APP_BUILD_VERSION,
        buildDate: import.meta.env.VITE_APP_BUILD_DATE,
        buildRevision: import.meta.env.VITE_APP_BUILD_REVISION,
      });
    }
  }, [services]);

  const [cookieConsentHeight, setCookieConsentHeight] = useState(0);

  const cookieConsentRef = useCallback((element: HTMLDivElement | null) => {
    const height = element?.getBoundingClientRect().height ?? 0;
    setCookieConsentHeight(height);
  }, []);

  return (
    <>
      <Box
        paddingBottom={cookieConsentHeight && `${cookieConsentHeight}px`}
        display="flex"
        flexDirection="column"
        flexGrow={1}
      >
        <Outlet />
      </Box>
      {!cookies.accepted_cookies && <CookieConsent ref={cookieConsentRef} />}
      <NotificationHandler />
    </>
  );
};

export default App;
