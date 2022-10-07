import React from 'react';
import ReactDOM from 'react-dom';
import { init as initApm } from '@elastic/apm-rum';
import reportWebVitals from './reportWebVitals';
import Root from './root';
import './common/styles/index.scss';

initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'alkemio-client-web',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'https://acc-apm.alkem.io',
  // Set service version (required for sourcemap feature)
  serviceVersion: require('../package.json').version,
  logLevel: 'debug',
  environment: process.env.NODE_ENV ?? 'dev',
  active: true,
});

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
