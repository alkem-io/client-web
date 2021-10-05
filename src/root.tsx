import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WinstonProvider } from 'winston-react';
import App from './components/composite/layout/App/App';
import AlkemioApolloProvider from './context/ApolloProvider';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { ConfigProvider } from './context/ConfigProvider';
import { GlobalStateProvider } from './context/GlobalStateProvider';
import { NavigationProvider } from './context/NavigationProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { UserProvider } from './context/UserProvider';
import { createStyles } from './hooks';
import './i18n/config';
import { Routing } from './routing/Routing';
import { logger } from './services/logging/winston/logger';
import { env } from './types/env';
import SentryErrorBoundaryProvider from './context/SentryErrorBoundaryProvider';
import ScrollToTop from './routing/ScrollToTop';

const graphQLEndpoint = (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql';

const useGlobalStyles = createStyles(theme => ({
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

const Root: FC = () => {
  useGlobalStyles();
  return (
    <ThemeProvider>
      <ConfigProvider apiUrl={graphQLEndpoint}>
        <SentryErrorBoundaryProvider>
          <WinstonProvider logger={logger}>
            <GlobalStateProvider>
              <BrowserRouter>
                <AuthenticationProvider>
                  <AlkemioApolloProvider apiUrl={graphQLEndpoint}>
                    <NavigationProvider>
                      <UserProvider>
                        <App>
                          <ScrollToTop />
                          <Routing />
                        </App>
                      </UserProvider>
                    </NavigationProvider>
                  </AlkemioApolloProvider>
                </AuthenticationProvider>
              </BrowserRouter>
            </GlobalStateProvider>
          </WinstonProvider>
        </SentryErrorBoundaryProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
};
export default Root;
