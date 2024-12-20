import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlkemioApolloProvider from '@/core/apollo/context/ApolloProvider';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import SentryErrorBoundaryProvider from '@/core/analytics/SentryErrorBoundaryProvider';
import ServerMetadataProvider from '@/domain/platform/metadata/ServerMetadataProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { UserProvider } from '@/domain/community/user/providers/UserProvider/UserProvider';
import '@/core/i18n/config';
import { TopLevelRoutes } from '@/main/routing/TopLevelRoutes';
import ScrollToTop from '@/core/routing/ScrollToTop';
import { CookiesProvider } from 'react-cookie';
import { privateGraphQLEndpoint, publicGraphQLEndpoint } from '@/main/constants/endpoints';
import { AuthenticationProvider } from '@/core/auth/authentication/context/AuthenticationProvider';
import { ConfigProvider } from '@/domain/platform/config/ConfigProvider';
import { fontFamilySourceSans, subHeading } from '@/core/ui/typography/themeTypographyOptions';
import { ApmProvider, ApmUserSetter } from '@/core/analytics/apm/context';
import { UserGeoProvider } from '@/core/analytics/geo';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import { PendingMembershipsDialogProvider } from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import { Error404 } from '@/core/pages/Errors/Error404';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { GlobalErrorProvider } from './core/lazyLoading/GlobalErrorContext';
import { GlobalErrorDialog } from './core/lazyLoading/GlobalErrorDialog';
import { InAppNotificationsProvider } from './main/inAppNotifications/InAppNotificationsContext';
import { InAppNotificationsDialog } from './main/inAppNotifications/InAppNotificationsDialog';

const useGlobalStyles = makeStyles(theme => ({
  '@global': {
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
      '-webkit-box-shadow': 'inset 0 0 6px #c3c3c3',
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
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    '[aria-role="heading"]': subHeading,
  },
}));

const GlobalStyles: FC = ({ children }) => {
  useGlobalStyles();
  return <>{children}</>;
};

const Root: FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <RootThemeProvider>
        <GlobalStyles>
          <CookiesProvider>
            <ConfigProvider url={publicGraphQLEndpoint}>
              <ServerMetadataProvider url={publicGraphQLEndpoint}>
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
                                        <ApmUserSetter />
                                        <ScrollToTop />
                                        <InAppNotificationsDialog />
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
              </ServerMetadataProvider>
            </ConfigProvider>
          </CookiesProvider>
        </GlobalStyles>
      </RootThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
