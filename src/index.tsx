import React from 'react';
import ReactDOM from 'react-dom';
import { init as initApm } from '@elastic/apm-rum';
import reportWebVitals from './reportWebVitals';
import Root from './root';
import './common/styles/index.scss';

initApm({
  serviceName: 'alkemio-client-web',
  serverUrl: 'https://acc-apm.alkem.io', // todo https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/alkem-io/server/2222
  serviceVersion: require('../package.json').version,
  environment: process.env.NODE_ENV ?? 'dev',
  active: process.env.NODE_ENV === 'production',
});

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
