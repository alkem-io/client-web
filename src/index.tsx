import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import configureStore from './store';
import './styles/index.scss';

declare global {
  interface Window {
    _env_?: {
      REACT_APP_GRAPHQL_ENDPOINT: string | undefined;
      REACT_APP_AUTHENTICATION_ENABLE: string | undefined;
      REACT_APP_AUTH_CLIENT_ID: string | undefined;
      REACT_APP_AUTH_TENANT_ID: string | undefined;
      REACT_APP_AUTH_API_SCOPE: string | undefined;
      REACT_APP_AUTH_REDIRECT_URI: string | undefined;
      REACT_APP_AUTH_RESOURCE_URI: string | undefined;
    };
  }
}

const env = window._env_;

const graphQLEndpoint =
  process.env.NODE_ENV === 'production'
    ? (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql'
    : (env && env.REACT_APP_GRAPHQL_ENDPOINT) || 'http://localhost:4000/graphql';

const enableAuthentication = (env && env.REACT_APP_AUTHENTICATION_ENABLE) !== 'false';

let indexPage = (
  <Provider store={configureStore()}>
    <AppContainer graphQLEndpoint={graphQLEndpoint} enableAuthentication={enableAuthentication} />
  </Provider>
);

if (!env) {
  indexPage = (
    <div className="container ">
      <div className="row justify-content-md-center">
        <h2>Configuration is missing!</h2>
      </div>
      <div className="row justify-content-md-center">
        <p>
          <a href="https://github.com/cherrytwist/Client.Web#configuration" target="#">
            More information!
          </a>
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(indexPage, document.getElementById('root'));
