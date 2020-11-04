import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { ThemeProvider } from './context/ThemeProvider';

import { ConfigProvider } from './context/ConfigProvider';
import configureStore from './store';
import { useGraphQLClient } from './hooks/useGraphQLClient';
import { env } from './env';
import App from './components/App';

const graphQLEndpoint =
  (env && env.REACT_APP_GRAPHQL_ENDPOINT) ||
  (process.env.NODE_ENV === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

const Root: FC = () => {
  return (
    <Provider store={configureStore()}>
      <ReduxRoot />
    </Provider>
  );
};

const ReduxRoot: FC = () => {
  const client = useGraphQLClient(graphQLEndpoint);

  return (
    <ApolloProvider client={client}>
      <ConfigProvider>
        <AuthenticationProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthenticationProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
};

export default Root;
