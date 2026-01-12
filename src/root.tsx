import SentryErrorBoundaryProvider from '@/core/analytics/SentryErrorBoundaryProvider';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import { ApmProvider, ApmUserSetter } from '@/core/analytics/apm/context';
import { UserGeoProvider } from '@/core/analytics/geo';
import AlkemioApolloProvider from '@/core/apollo/context/ApolloProvider';
import { AuthenticationProvider } from '@/core/auth/authentication/context/AuthenticationProvider';
import '@/core/i18n/config';
import { Error40XBoundary } from '@/core/40XErrorHandler/ErrorBoundary';
import { Error40X } from './core/pages/Errors/Error40X';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { NavigationHistoryTracker } from '@/core/routing/NavigationHistory';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { fontFamilySourceSans, subHeading } from '@/core/ui/typography/themeTypographyOptions';
import { PendingMembershipsDialogProvider } from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { UserProvider } from '@/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider';
import { ConfigProvider } from '@/domain/platform/config/ConfigProvider';
import { privateGraphQLEndpoint, publicGraphQLEndpoint } from '@/main/constants/endpoints';
import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import GlobalStyles from '@mui/material/GlobalStyles';
import { StyledEngineProvider, Theme } from '@mui/material/styles';
import { FC } from 'react';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { GlobalErrorProvider } from './core/lazyLoading/GlobalErrorContext';
import { InAppNotificationsProvider } from './main/inAppNotifications/InAppNotificationsContext';
import { UserMessagingProvider } from './main/userMessaging/UserMessagingContext';
import { VersionHandling } from './main/versionHandling';
import { InAppNotificationCountSubscriber } from '@/main/inAppNotifications/inAppNotificationCountSubscriber';
import { ConversationsUnreadCountSubscriber } from '@/main/userMessaging/ConversationsUnreadCountSubscriber';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Suspense } from 'react';

const GlobalErrorDialog = lazyWithGlobalErrorHandler(() => import('./core/lazyLoading/GlobalErrorDialog'));
const InAppNotificationsDialog = lazyWithGlobalErrorHandler(
  () => import('./main/inAppNotifications/InAppNotificationsDialog')
);
const UserMessagingDialog = lazyWithGlobalErrorHandler(() => import('./main/userMessaging/UserMessagingDialog'));

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
    paddingTop: '10px',
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
    <StyledEngineProvider injectFirst>
      <RootThemeProvider>
        <GlobalStyles styles={globalStyles} />
        <CookiesProvider>
          <ConfigProvider url={publicGraphQLEndpoint}>
            <SentryTransactionScopeContextProvider>
              <SentryErrorBoundaryProvider>
                <GlobalStateProvider>
                  <GlobalErrorProvider>
                    <BrowserRouter>
                      <AuthenticationProvider>
                        <UserGeoProvider>
                          <ApmProvider>
                            <AlkemioApolloProvider apiUrl={privateGraphQLEndpoint}>
                              <UserProvider>
                                <PendingMembershipsDialogProvider>
                                  <InAppNotificationsProvider>
                                    <UserMessagingProvider>
                                      <NavigationHistoryTracker />
                                      <ApmUserSetter />
                                      <ScrollToTop />
                                      <Suspense fallback={null}>
                                        <InAppNotificationsDialog />
                                      </Suspense>
                                      <InAppNotificationCountSubscriber />
                                      <ConversationsUnreadCountSubscriber />
                                      <Suspense fallback={null}>
                                        <UserMessagingDialog />
                                      </Suspense>
                                      <VersionHandling />
                                      <Error40XBoundary
                                        errorComponent={errorState => (
                                          <TopLevelLayout>
                                            <Error40X {...errorState} />
                                          </TopLevelLayout>
                                        )}
                                      >
                                        <TopLevelRoutes />
                                        <Suspense fallback={null}>
                                          <GlobalErrorDialog />
                                        </Suspense>
                                      </Error40XBoundary>
                                    </UserMessagingProvider>
                                  </InAppNotificationsProvider>
                                </PendingMembershipsDialogProvider>
                              </UserProvider>
                            </AlkemioApolloProvider>
                          </ApmProvider>
                        </UserGeoProvider>
                      </AuthenticationProvider>
                    </BrowserRouter>
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
