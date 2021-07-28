import { ApolloProvider } from '@apollo/client';
import * as Sentry from '@sentry/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { ConfigProvider } from './context/ConfigProvider';
import { EcoversesProvider } from './context/EcoversesProvider';
import { NavigationProvider } from './context/NavigationProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { UserProvider } from './context/UserProvider';
import { env } from './types/env';
import { createStyles, useGraphQLClient } from './hooks';
import './i18n/config';
import App from './components/composite/layout/App/App';
import { Error as ErrorPage } from './pages/Error';
import { Routing } from './routing/routing';
import sentryBootstrap from './services/sentry/bootstrap';
import configureStore from './store';

const graphQLEndpoint = (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql';

sentryBootstrap();

const useGlobalStyles = createStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px #c3c3c3',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary,
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
    <Sentry.ErrorBoundary
      fallback={({ error }) => {
        return <ErrorPage error={error} />;
      }}
    >
      <Provider store={configureStore()}>
        <ReduxRoot />
      </Provider>
    </Sentry.ErrorBoundary>
  );
};

const ReduxRoot: FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider apiUrl={graphQLEndpoint}>
        <AuthenticationProvider>
          <CTApolloProvider>
            <ThemeProvider>
              <NavigationProvider>
                <EcoversesProvider>
                  <UserProvider>
                    <App>
                      <Routing />
                    </App>
                  </UserProvider>
                </EcoversesProvider>
              </NavigationProvider>
            </ThemeProvider>
          </CTApolloProvider>
        </AuthenticationProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};

const CTApolloProvider: FC = ({ children }) => {
  const client = useGraphQLClient(graphQLEndpoint);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Root;
