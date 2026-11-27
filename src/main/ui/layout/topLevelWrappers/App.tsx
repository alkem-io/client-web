import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUserScope } from '@/core/analytics/SentryTransactionScopeContext';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { CrdNotificationHandler } from '@/core/ui/notifications/CrdNotificationHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { LanguageOfferProvider } from '@/domain/language/LanguageOfferContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import {
  useAlkemioCookies,
  useCleanUpApmCookie,
  useMigrateConsentCookieToApex,
} from '@/main/cookies/useAlkemioCookies';

const CookieConsent = lazyWithGlobalErrorHandler(() => import('@/main/cookies/CrdCookieConsent'));

const App = () => {
  const { consent } = useAlkemioCookies();
  // Collapse a pre-fix host-only consent cookie into the shared apex cookie (#9695).
  useMigrateConsentCookieToApex();
  useCleanUpApmCookie();
  const { userModel } = useCurrentUserContext();

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
  // The fixed bottom bars (menu bars, the unsaved-changes bar, the new-version card) sit on
  // --cookie-banner-height so the banner never covers them.
  // Set on the root element because one of them is portalled to document.body.
  const cookieConsentRef = useCallback((element: HTMLElement | null) => {
    const height = element?.getBoundingClientRect().height ?? 0;
    setCookieConsentHeight(height);
    document.documentElement.style.setProperty('--cookie-banner-height', `${height}px`);
  }, []);

  return (
    // LanguageOfferProvider is hoisted here — above all CrdLayoutWrapper route groups —
    // so in-memory anonymous choice survives client-side navigation between route groups
    // without requiring localStorage (corr-client-4 / SC-004 / FR-013b-i).
    <LanguageOfferProvider>
      <div
        className="flex flex-col flex-grow"
        style={cookieConsentHeight ? { paddingBottom: `${cookieConsentHeight}px` } : undefined}
      >
        {/* position: relative so the space layout's absolutely-positioned navigation bar
            anchors below the banner instead of overlapping it at the viewport top. */}
        <div className="relative flex flex-col flex-grow">
          <Outlet />
        </div>
      </div>
      {/* A malformed consent cookie is no choice, so the banner asks again. */}
      {!consent.decided && (
        <Suspense fallback={null}>
          <CookieConsent ref={cookieConsentRef} />
        </Suspense>
      )}
      <CrdNotificationHandler />
    </LanguageOfferProvider>
  );
};

export default App;
