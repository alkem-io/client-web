import '@/core/i18n/config';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter, createRoutesFromElements, matchRoutes, useLocation } from 'react-router-dom';
import { Error40XBoundary } from '@/core/40XErrorHandler/ErrorBoundary';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import { isSessionStoreUnavailable } from '@/core/apollo/v2/isSessionStoreUnavailable';
import { V2ApolloProvider } from '@/core/apollo/v2/V2ApolloProvider';
import { IdentityRoute } from '@/core/auth/authentication/routing/IdentityRoute';
import { NativeFoundationContext, NativeFoundationProvider } from '@/core/foundation/NativeFoundationProvider';
import { GlobalErrorProvider } from '@/core/lazyLoading/GlobalErrorContext';
import { MatrixSession } from '@/core/matrix/MatrixSessionProvider';
import { NavigationHistoryTracker } from '@/core/routing/NavigationHistory';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { FullscreenEditorProvider, useIsFullscreenEditorOpen } from '@/core/ui/fullscreen/FullscreenEditorContext';
import { CrdNotificationHandler } from '@/core/ui/notifications/CrdNotificationHandler';
import { NativeCurrentUserProvider } from '@/domain/community/userCurrent/native/NativeCurrentUserProvider';
import { NativeConfigProvider } from '@/domain/platform/config/native/NativeConfigProvider';
import { privateGraphQLEndpoint } from '@/main/constants/endpoints';
import { CrdAwareErrorComponent } from '@/main/crdPages/error/CrdAwareErrorComponent';
import CrdGlobalErrorDialog from '@/main/crdPages/error/CrdGlobalErrorDialog';
import { UnifiedChatLauncher } from '@/main/crdPages/unifiedChat/UnifiedChatLauncher';
import { UnifiedChatProvider } from '@/main/crdPages/unifiedChat/UnifiedChatProvider';
import { OnlineStatusNotification } from '@/main/onlineStatus/OnlineStatusNotification';
import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';
import { VersionHandling } from '@/main/versionHandling';

/** The unified chat's floating launcher beside every page but the identity pages, hidden while a fullscreen editor is open. */
function UnifiedChatGate() {
  const location = useLocation();
  const fullscreen = useIsFullscreenEditorOpen();
  // IdentityRoute is called during render, as TopLevelRoutes calls it: compiled, it uses hooks.
  const identityPage = matchRoutes(createRoutesFromElements(IdentityRoute()), location);
  return identityPage ? null : <UnifiedChatLauncher hidden={fullscreen} />;
}

export default function Root() {
  return (
    <CookiesProvider>
      <V2ApolloProvider uri={privateGraphQLEndpoint}>
        {/* As legacy root.tsx: every route's useTransactionScope (e.g. /required) finds its provider. */}
        <SentryTransactionScopeContextProvider>
          <GlobalStateProvider>
            <GlobalErrorProvider>
              <BrowserRouter>
                <NativeFoundationProvider>
                  <FullscreenEditorProvider>
                    <NavigationHistoryTracker />
                    <ScrollToTop />
                    <VersionHandling />
                    <OnlineStatusNotification />
                    <Error40XBoundary errorComponent={errorState => <CrdAwareErrorComponent {...errorState} />}>
                      <NativeConfigProvider
                        matrixSession={sessionBaseUrl => <MatrixSession sessionBaseUrl={sessionBaseUrl} />}
                      >
                        <NativeFoundationContext.Consumer>
                          {foundation =>
                            foundation?.error && !isSessionStoreUnavailable(foundation.error) ? (
                              <p role="alert">{foundation.error.message}</p>
                            ) : null
                          }
                        </NativeFoundationContext.Consumer>
                        <NativeCurrentUserProvider>
                          <UnifiedChatProvider>
                            <TopLevelRoutes />
                            <UnifiedChatGate />
                          </UnifiedChatProvider>
                        </NativeCurrentUserProvider>
                      </NativeConfigProvider>
                      <CrdGlobalErrorDialog />
                    </Error40XBoundary>
                    <CrdNotificationHandler />
                  </FullscreenEditorProvider>
                </NativeFoundationProvider>
              </BrowserRouter>
            </GlobalErrorProvider>
          </GlobalStateProvider>
        </SentryTransactionScopeContextProvider>
      </V2ApolloProvider>
    </CookiesProvider>
  );
}
