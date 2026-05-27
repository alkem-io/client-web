import { Box } from '@mui/material';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Outlet } from 'react-router-dom';
import { useUserScope } from '@/core/analytics/SentryTransactionScopeContext';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { CrdNotificationHandler } from '@/core/ui/notifications/CrdNotificationHandler';
import { NotificationHandler } from '@/core/ui/notifications/NotificationHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ALKEMIO_COOKIE_NAME } from '@/main/cookies/useAlkemioCookies';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';

const CookieConsent = lazyWithGlobalErrorHandler(() => import('@/main/cookies/CookieConsent'));

const App = () => {
  const [cookies] = useCookies([ALKEMIO_COOKIE_NAME]);
  const { userModel } = useCurrentUserContext();
  const crdEnabled = useCrdEnabled();

  useUserScope(userModel);

  const {
    serverMetadata: { services },
  } = useConfig();

  useEffect(() => {
    if (services.length) {
    }
  }, [services]);

  const [cookieConsentHeight, setCookieConsentHeight] = useState(0);

  // Keep useCallback: ref callback that calls setState. Without stable reference, React
  // re-invokes with null then element on every render → setCookieConsentHeight oscillates → infinite loop.
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
      {crdEnabled ? <CrdNotificationHandler /> : <NotificationHandler />}
    </>
  );
};

export default App;
