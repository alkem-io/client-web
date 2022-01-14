import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlkemioApolloProvider from './context/ApolloProvider';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { ConfigProvider } from './context/ConfigProvider';
import { GlobalStateProvider } from './context/GlobalStateProvider';
import { NavigationProvider } from './context/NavigationProvider';
import SentryErrorBoundaryProvider from './context/SentryErrorBoundaryProvider';
import ServerMetadataProvider from './context/ServerMetadataProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { UserProvider } from './context/UserProvider';
import './i18n/config';
import { Routing } from './routing/Routing';
import ScrollToTop from './routing/ScrollToTop';
import { env } from './types/env';

const domain = (env && env.REACT_APP_ALKEMIO_DOMAIN) ?? '';
export const publicGraphQLEndpoint = domain + '/api/public/graphql';
export const privateGraphQLEndpoint = domain + '/api/private/graphql';

const useGlobalStyles = makeStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
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
      height: '100%',
    },
    '#app': {
      height: '100%',
      minHeight: '100%',
      display: 'flex',
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
                            <ScrollToTop />
                            <Routing />
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
