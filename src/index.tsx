import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import configureStore from './store';
import './styles/index.css';

const graphQLEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
const enableAuthentication =
  process.env.REACT_APP_AUTHENTICATION_ENABLE === undefined ||
  process.env.REACT_APP_AUTHENTICATION_ENABLE.toLowerCase() === 'true';

ReactDOM.render(
  <Provider store={configureStore()}>
    <AppContainer graphQLEndpoint={graphQLEndpoint} enableAuthentication={enableAuthentication} />
  </Provider>,
  document.getElementById('root')
);
