import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

const bootstrap = (sentryEnabled?: boolean, sentryEndpoint?: string) => {
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
