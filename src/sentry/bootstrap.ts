import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { env } from '../env';

const sentryEndpoint = env && env.REACT_APP_SENTRY_ENDPOINT;
const sentryEnabled =
  env && env.REACT_APP_SENTRY_ENABLED && env.REACT_APP_SENTRY_ENABLED.toLocaleLowerCase() === 'true';

const bootstrap = () => {
  if (sentryEnabled && sentryEndpoint) {
    Sentry.init({
      dsn: sentryEndpoint,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      release: `${process.env.REACT_APP_NAME}@${process.env.REACT_APP_VERSION}`,
    });
  }
};

export default bootstrap;
