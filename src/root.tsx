import { ApmProvider, ApmUserSetter } from '@/core/analytics/apm/context';
import { UserGeoProvider } from '@/core/analytics/geo';
import SentryErrorBoundaryProvider from '@/core/analytics/SentryErrorBoundaryProvider';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import AlkemioApolloProvider from '@/core/apollo/context/ApolloProvider';
import { AuthenticationProvider } from '@/core/auth/authentication/context/AuthenticationProvider';
import '@/core/i18n/config';
import GlobalStyles from '@mui/material/GlobalStyles';
import { StyledEngineProvider, type Theme } from '@mui/material/styles';
import { type FC, Suspense } from 'react';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { Error40XBoundary } from '@/core/40XErrorHandler/ErrorBoundary';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { NavigationHistoryTracker } from '@/core/routing/NavigationHistory';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { fontFamilySourceSans, subHeading } from '@/core/ui/typography/themeTypographyOptions';
import { PendingMembershipsDialogProvider } from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { UserProvider } from '@/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider';
import { ConfigProvider } from '@/domain/platform/config/ConfigProvider';
import { privateGraphQLEndpoint, publicGraphQLEndpoint } from '@/main/constants/endpoints';
import { CrdAwareErrorComponent } from '@/main/crdPages/error/CrdAwareErrorComponent';
import { InAppNotificationCountSubscriber } from '@/main/inAppNotifications/inAppNotificationCountSubscriber';
import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';
import { GlobalErrorProvider } from './core/lazyLoading/GlobalErrorContext';
import { useCrdEnabled } from './main/crdPages/useCrdEnabled';
import { InAppNotificationsProvider } from './main/inAppNotifications/InAppNotificationsContext';
import { OnlineStatusNotification } from './main/onlineStatus/OnlineStatusNotification';
import { PushNotificationProvider } from './main/pushNotifications/PushNotificationProvider';
import { UserMessagingProvider } from './main/userMessaging/UserMessagingContext';
import { VersionHandling } from './main/versionHandling';

const GlobalErrorDialog = lazyWithGlobalErrorHandler(() => import('./core/lazyLoading/GlobalErrorDialog'));
const InAppNotificationsDialog = lazyWithGlobalErrorHandler(
  () => import('./main/inAppNotifications/InAppNotificationsDialog')
);
const UserMessagingDialog = lazyWithGlobalErrorHandler(() => import('./main/userMessaging/UserMessagingDialog'));

const CrdNotificationsPanelConnector = lazyWithGlobalErrorHandler(
  () => import('./main/ui/layout/CrdNotificationsPanelConnector')
);

/** Renders either the CRD or MUI notifications dialog based on the design toggle. */
function NotificationsGate() {
  const crdEnabled = useCrdEnabled();
  return (
    <Suspense fallback={null}>
      {crdEnabled ? <CrdNotificationsPanelConnector /> : <InAppNotificationsDialog />}
    </Suspense>
  );
}

// MARKDOWN_CLASS_NAME used in the styles below
const globalStyles = (theme: Theme) => ({
  '*': {
    scrollbarColor: `${theme.palette.primary.main} transparent`,
  },
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
  '*::-webkit-scrollbar': {
    width: 'max(.75vw, 0.5em)',
  },
  '*::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 6px #c3c3c3',
  },
  '*::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
  },
  html: {
    height: '100%',
  },
  body: {
    height: '100%',
    margin: 0,
    fontFamily: fontFamilySourceSans,
  },
  '#root': {
    height: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  '[aria-role="heading"]': subHeading,
  '.markdown': {
    wordWrap: 'break-word',
  },
  '.markdown > pre': {
    whiteSpace: 'pre-wrap',
  },
  '.tiptap p, .markdown p, .tiptap table, .markdown table': {
    margin: 0,
    fontFamily: fontFamilySourceSans,
    fontSize: 12,
    lineHeight: '20px',
    letterSpacing: '0.13px',
  },
  '.tiptap ul, .markdown ul, .tiptap ol, .markdown ol': {
    margin: 0,
  },
  '.tiptap h1, .markdown h1': {
    paddingTop: '10px',
    fontFamily: fontFamilySourceSans,
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: '0.13px',
  },
  '.tiptap h2, .markdown h2': {
    paddingTop: '10px',
    fontFamily: fontFamilySourceSans,
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: '20px',
    letterSpacing: '0.13px',
  },
  '.tiptap h3, .markdown h3': {
    paddingTop: '10px',
    fontFamily: fontFamilySourceSans,
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: '20px',
    letterSpacing: '0.13px',
  },
  '.excalidraw-modal-container': {
    zIndex: `${theme.zIndex.modal + 1} !important`,
  },
});

const Root: FC = () => {
  return (
    <StyledEngineProvider injectFirst={true}>
      <RootThemeProvider>
        <GlobalStyles styles={globalStyles} />
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
                                      <UserMessagingProvider>
                                        <NavigationHistoryTracker />
                                        <ApmUserSetter />
                                        <ScrollToTop />
                                        <NotificationsGate />
                                        <InAppNotificationCountSubscriber />
                                        <Suspense fallback={null}>
                                          <UserMessagingDialog />
                                        </Suspense>
                                        <VersionHandling />
                                        <OnlineStatusNotification />
                                        <Error40XBoundary
                                          errorComponent={errorState => <CrdAwareErrorComponent {...errorState} />}
                                        >
                                          <TopLevelRoutes />
                                          <Suspense fallback={null}>
                                            <GlobalErrorDialog />
                                          </Suspense>
                                        </Error40XBoundary>
                                      </UserMessagingProvider>
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
      </RootThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
