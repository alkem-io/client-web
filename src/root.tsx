import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlkemioApolloProvider from './core/apollo/context/ApolloProvider';
import { GlobalStateProvider } from './context/GlobalStateProvider';
import { NavigationProvider } from './context/NavigationProvider';
import SentryErrorBoundaryProvider from './context/SentryErrorBoundaryProvider';
import ServerMetadataProvider from './context/ServerMetadataProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { UserProvider } from './domain/user/providers/UserProvider/UserProvider';
import './core/i18n/config';
import { Routing } from './routing/Routing';
import ScrollToTop from './routing/ScrollToTop';
import { CookiesProvider } from 'react-cookie';
import { publicGraphQLEndpoint, privateGraphQLEndpoint } from './common/constants/endpoints';
import { AuthenticationProvider } from './core/auth/authentication/context/AuthenticationProvider';
import { ConfigProvider } from './config/context/ConfigProvider';

const useGlobalStyles = makeStyles(theme => ({
  '@global': {
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
      fontFamily: '"Source Sans Pro", "Montserrat"',
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
  },
}));

const GlobalStyles: FC = ({ children }) => {
  useGlobalStyles();
  return <>{children}</>;
};

const Root: FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
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
                              <Routing />
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
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
export default Root;
