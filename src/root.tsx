import SentryErrorBoundaryProvider from '@/core/analytics/SentryErrorBoundaryProvider';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import { ApmProvider, ApmUserSetter } from '@/core/analytics/apm/context';
import { UserGeoProvider } from '@/core/analytics/geo';
import AlkemioApolloProvider from '@/core/apollo/context/ApolloProvider';
import { AuthenticationProvider } from '@/core/auth/authentication/context/AuthenticationProvider';
import '@/core/i18n/config';
import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import { Error404 } from '@/core/pages/Errors/Error404';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { NavigationHistoryTracker } from '@/core/routing/NavigationHistory';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { fontFamilySourceSans, fontFamilyVerdana, subHeading } from '@/core/ui/typography/themeTypographyOptions';
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
import { GlobalErrorDialog } from './core/lazyLoading/GlobalErrorDialog';
import { InAppNotificationsProvider } from './main/inAppNotifications/InAppNotificationsContext';
import { InAppNotificationsDialog } from './main/inAppNotifications/InAppNotificationsDialog';
import { UserMessagingProvider } from './main/userMessaging/UserMessagingContext';
import { UserMessagingDialog } from './main/userMessaging/UserMessagingDialog';
import { VersionHandling } from './main/versionHandling';
import { rem } from '@/core/ui/typography/utils';
import { InAppNotificationCountSubscriber } from '@/main/inAppNotifications/inAppNotificationCountSubscriber';

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
  '.tiptap p, .markdown p': {
    fontFamily: fontFamilyVerdana,
    fontSize: rem(12),
  },
  '.tiptap h1, .markdown h1': {
    fontFamily: fontFamilyVerdana,
    fontWeight: 'bold',
    fontSize: rem(14),
    lineHeight: rem(20),
  },
  '.tiptap h2, .markdown h2': {
    fontFamily: fontFamilyVerdana,
    fontWeight: 'bold',
    fontSize: rem(13),
    lineHeight: rem(20),
  },
  '.tiptap h3, .markdown h3': {
    fontFamily: fontFamilyVerdana,
    fontWeight: 'bold',
    fontSize: rem(12),
    lineHeight: rem(20),
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
                                      <InAppNotificationsDialog />
                                      <InAppNotificationCountSubscriber />
                                      <UserMessagingDialog />
                                      <VersionHandling />
                                      <NotFoundErrorBoundary
                                        errorComponent={
                                          <TopLevelLayout>
                                            <Error404 />
                                          </TopLevelLayout>
                                        }
                                      >
                                        <TopLevelRoutes />
                                        <GlobalErrorDialog />
                                      </NotFoundErrorBoundary>
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
