import { useCallback, useEffect, useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationHandler } from '@/core/ui/notifications/NotificationHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUserScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCookies } from 'react-cookie';
import { ALKEMIO_COOKIE_NAME } from '@/main/cookies/useAlkemioCookies';
import { Box } from '@mui/material';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const CookieConsent = lazyWithGlobalErrorHandler(() => import('@/main/cookies/CookieConsent'));

const App = () => {
  const [cookies] = useCookies([ALKEMIO_COOKIE_NAME]);
  const { userModel } = useCurrentUserContext();

  useUserScope(userModel);

  const {
    serverMetadata: { services },
  } = useConfig();

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
      {!cookies.accepted_cookies && (
        <Suspense fallback={null}>
          <CookieConsent ref={cookieConsentRef} />
        </Suspense>
      )}
      <NotificationHandler />
    </>
  );
};

export default App;
