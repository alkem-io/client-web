import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import configureStore from './store';
import './styles/index.scss';

const graphQLEndpoint =
  process.env.NODE_ENV === 'production'
    ? '/graphql'
    : process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const enableAuthentication =
  process.env.REACT_APP_AUTHENTICATION_ENABLE === undefined || process.env.REACT_APP_AUTHENTICATION_ENABLE === 'true';

console.log('GraphQL Endpoint: ', graphQLEndpoint);
console.log('Enable Authentication: ', enableAuthentication);

ReactDOM.render(
  <Provider store={configureStore()}>
    <AppContainer graphQLEndpoint={graphQLEndpoint} enableAuthentication={enableAuthentication} />
  </Provider>,
  document.getElementById('root')
);
