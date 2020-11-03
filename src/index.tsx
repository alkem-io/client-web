import { ApolloProvider } from '@apollo/client';
import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import { AppProvider } from './context/AppProvider';
import { ConfigProvider } from './context/ConfigProvider';
import { env } from './env';
import { useGraphQLClient } from './hooks';
import configureStore from './store';
import './styles/index.scss';

const graphQLEndpoint =
  (env && env.REACT_APP_GRAPHQL_ENDPOINT) ||
  (process.env.NODE_ENV === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

export const CTApolloProvider: FC = ({ children }) => {
  const client = useGraphQLClient(graphQLEndpoint);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

ReactDOM.render(
  <Provider store={configureStore()}>
    <CTApolloProvider>
      <ConfigProvider>
        <AppProvider>
          <AppContainer />
        </AppProvider>
      </ConfigProvider>
    </CTApolloProvider>
  </Provider>,
  document.getElementById('root')
);
