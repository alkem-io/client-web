import { ApolloProvider } from '@apollo/client';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { ConfigProvider } from './context/ConfigProvider';
import { NavigationProvider } from './context/NavigationProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { UserProvider } from './context/UserProvider';
import { env } from './env';
import { useGraphQLClient } from './hooks/useGraphQLClient';
import { Routing } from './navigation';
import configureStore from './store';
import * as Sentry from '@sentry/react';
import sentryBootstrap from './sentry/bootstrap';
import { Error as ErrorPage } from './pages/Error';
import { createStyles } from './hooks/useTheme';
import { AccessProvider } from './context/AccessProvider';

const graphQLEndpoint =
  (env && env.REACT_APP_GRAPHQL_ENDPOINT) ||
  (process.env.NODE_ENV === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

sentryBootstrap();

const useGlobalStyles = createStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px grey',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary,
      outline: `1px solid ${theme.palette.neutral}`,
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
      flexDirection: 'column',
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
  const client = useGraphQLClient(graphQLEndpoint);

  return (
    <ApolloProvider client={client}>
      <ConfigProvider>
        <AuthenticationProvider>
          <AccessProvider>
            <ThemeProvider>
              <NavigationProvider>
                <UserProvider>
                  <BrowserRouter>
                    <App>
                      <Routing />
                    </App>
                  </BrowserRouter>
                </UserProvider>
              </NavigationProvider>
            </ThemeProvider>
          </AccessProvider>
        </AuthenticationProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
};

export default Root;
