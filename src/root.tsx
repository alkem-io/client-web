import { ApmProvider, ApmUserSetter } from '@/core/analytics/apm/context';
import { UserGeoProvider } from '@/core/analytics/geo';
import SentryErrorBoundaryProvider from '@/core/analytics/SentryErrorBoundaryProvider';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import AlkemioApolloProvider from '@/core/apollo/context/ApolloProvider';
import { AuthenticationProvider } from '@/core/auth/authentication/context/AuthenticationProvider';
import { IdentityRoutes } from '@/core/auth/authentication/routing/IdentityRoute';
import '@/core/i18n/config';
import { type FC, Suspense } from 'react';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Error40XBoundary } from '@/core/40XErrorHandler/ErrorBoundary';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { NavigationHistoryTracker } from '@/core/routing/NavigationHistory';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { FullscreenEditorProvider, useIsFullscreenEditorOpen } from '@/core/ui/fullscreen/FullscreenEditorContext';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { PendingMembershipsDialogProvider } from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { UserProvider } from '@/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider';
import { ConfigProvider } from '@/domain/platform/config/ConfigProvider';
import { privateGraphQLEndpoint, publicGraphQLEndpoint } from '@/main/constants/endpoints';
import { CrdAwareErrorComponent } from '@/main/crdPages/error/CrdAwareErrorComponent';
import { UnifiedChatLauncher } from '@/main/crdPages/unifiedChat/UnifiedChatLauncher';
import { UnifiedChatProvider } from '@/main/crdPages/unifiedChat/UnifiedChatProvider';
import { InAppNotificationCountSubscriber } from '@/main/inAppNotifications/inAppNotificationCountSubscriber';
import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';
import { GlobalErrorProvider } from './core/lazyLoading/GlobalErrorContext';
import { InAppNotificationsProvider } from './main/inAppNotifications/InAppNotificationsContext';
import { OnlineStatusNotification } from './main/onlineStatus/OnlineStatusNotification';
import { PushNotificationProvider } from './main/pushNotifications/PushNotificationProvider';
import { VersionHandling } from './main/versionHandling';

const CrdGlobalErrorDialog = lazyWithGlobalErrorHandler(() => import('./main/crdPages/error/CrdGlobalErrorDialog'));

const CrdNotificationsPanelConnector = lazyWithGlobalErrorHandler(
  () => import('./main/ui/layout/CrdNotificationsPanelConnector')
);

/** Renders the CRD notifications panel. */
function NotificationsGate() {
  return (
    <Suspense fallback={null}>
      <CrdNotificationsPanelConnector />
    </Suspense>
  );
}

/** Renders the CRD global (chunk-load) error dialog. */
function GlobalErrorDialogGate() {
  return (
    <Suspense fallback={null}>
      <CrdGlobalErrorDialog />
    </Suspense>
  );
}

/** Top-level path segments owned by the auth flow — the unified chat is hidden on all of them. */
const AUTH_ROUTE_SEGMENTS = new Set<string>(Object.values(IdentityRoutes));

/**
 * Mounts the unified chat floating launcher. The unified surface is the only
 * messaging entry point, so it is NOT hidden on mobile — only on auth flows and
 * immersive/fullscreen editors.
 */
function UnifiedChatGate() {
  const { pathname } = useLocation();
  const { fullscreen } = useFullscreen();
  const isFullscreenEditorOpen = useIsFullscreenEditorOpen();
  const isAuthPage = AUTH_ROUTE_SEGMENTS.has(pathname.split('/')[1]);
  return <UnifiedChatLauncher hidden={isAuthPage || fullscreen || isFullscreenEditorOpen} />;
}

const Root: FC = () => {
  return (
    <CookiesProvider>
      <ConfigProvider url={publicGraphQLEndpoint}>
        <SentryTransactionScopeContextProvider>
          <SentryErrorBoundaryProvider>
            <GlobalStateProvider>
              <GlobalErrorProvider>
                <AuthenticationProvider>
                  <BrowserRouter>
                    <UserGeoProvider>
                      <ApmProvider>
                        <AlkemioApolloProvider apiUrl={privateGraphQLEndpoint}>
                          <UserProvider>
                            <PendingMembershipsDialogProvider>
                              <InAppNotificationsProvider>
                                <PushNotificationProvider>
                                  <UnifiedChatProvider>
                                    <FullscreenEditorProvider>
                                      <NavigationHistoryTracker />
                                      <ApmUserSetter />
                                      <ScrollToTop />
                                      <NotificationsGate />
                                      <InAppNotificationCountSubscriber />
                                      <VersionHandling />
                                      <OnlineStatusNotification />
                                      <Error40XBoundary
                                        errorComponent={errorState => <CrdAwareErrorComponent {...errorState} />}
                                      >
                                        <TopLevelRoutes />
                                        <GlobalErrorDialogGate />
                                      </Error40XBoundary>
                                      {/* Rendered after TopLevelRoutes so the full-screen mobile chat
                                          panel (z-50) paints above the app header (also z-50). */}
                                      <UnifiedChatGate />
                                    </FullscreenEditorProvider>
                                  </UnifiedChatProvider>
                                </PushNotificationProvider>
                              </InAppNotificationsProvider>
                            </PendingMembershipsDialogProvider>
                          </UserProvider>
                        </AlkemioApolloProvider>
                      </ApmProvider>
                    </UserGeoProvider>
                  </BrowserRouter>
                </AuthenticationProvider>
              </GlobalErrorProvider>
            </GlobalStateProvider>
          </SentryErrorBoundaryProvider>
        </SentryTransactionScopeContextProvider>
      </ConfigProvider>
    </CookiesProvider>
  );
};

export default Root;
