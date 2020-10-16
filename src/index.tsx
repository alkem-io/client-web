import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import configureStore from './store';
import './styles/index.scss';

declare global {
  interface Window {
    _env_:any;
  }
}
const graphQLEndpoint = window._env_.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const enableAuthentication =
window._env_.REACT_APP_AUTHENTICATION_ENABLE === undefined || window._env_.REACT_APP_AUTHENTICATION_ENABLE === 'true';

console.log('GraphQL Endpoint: ', graphQLEndpoint);
console.log('Enable Authentication: ', enableAuthentication);

ReactDOM.render(
  <Provider store={configureStore()}>
    <AppContainer graphQLEndpoint={graphQLEndpoint} enableAuthentication={enableAuthentication} />
  </Provider>,
  document.getElementById('root')
);
