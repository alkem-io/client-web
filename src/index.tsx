import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import configureStore from './store';
import './styles/index.css';

const graphQLEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const client = new ApolloClient({
  uri: graphQLEndpoint,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={configureStore()}>
      <AppContainer />
    </Provider>
  </ApolloProvider>,
  document.getElementById('root')
);
