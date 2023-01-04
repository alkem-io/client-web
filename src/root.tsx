import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlkemioApolloProvider from './core/apollo/context/ApolloProvider';
import { GlobalStateProvider } from './core/state/GlobalStateProvider';
import { NavigationProvider } from './core/routing/NavigationProvider';
import SentryErrorBoundaryProvider from './core/analytics/SentryErrorBoundaryProvider';
import ServerMetadataProvider from './domain/platform/metadata/ServerMetadataProvider';
import RootThemeProvider from './core/ui/themes/RootThemeProvider';
import { UserProvider } from './domain/community/contributor/user/providers/UserProvider/UserProvider';
import './core/i18n/config';
import { TopLevelRoutes } from './core/routing/TopLevelRoutes';
import ScrollToTop from './core/routing/ScrollToTop';
import { CookiesProvider } from 'react-cookie';
import { privateGraphQLEndpoint, publicGraphQLEndpoint } from './common/constants/endpoints';
import { AuthenticationProvider } from './core/auth/authentication/context/AuthenticationProvider';
import { ConfigProvider } from './domain/platform/config/ConfigProvider';
import { fontFamilySourceSans, subHeading } from './core/ui/typography/themeTypographyOptions';

const useGlobalStyles = makeStyles(theme => ({
  '@global': {
    '*': {
      scrollbarColor: `${theme.palette.primary.main} transparent`,
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
    '#main': {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      position: 'relative',
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
          <ConfigProvider url={publicGraphQLEndpoint}>
            <ServerMetadataProvider url={publicGraphQLEndpoint}>
              <SentryErrorBoundaryProvider>
                <GlobalStateProvider>
                  <BrowserRouter>
                    <AuthenticationProvider>
                      <AlkemioApolloProvider apiUrl={privateGraphQLEndpoint}>
                        <NavigationProvider>
                          <UserProvider>
                            <CookiesProvider>
                              <ScrollToTop />
                              <TopLevelRoutes />
                            </CookiesProvider>
                          </UserProvider>
                        </NavigationProvider>
                      </AlkemioApolloProvider>
                    </AuthenticationProvider>
                  </BrowserRouter>
                </GlobalStateProvider>
              </SentryErrorBoundaryProvider>
            </ServerMetadataProvider>
          </ConfigProvider>
        </GlobalStyles>
      </RootThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
