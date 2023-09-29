import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

const bootstrap = (sentryEnabled?: boolean, sentryEndpoint?: string) => {
  if (sentryEnabled && sentryEndpoint) {
    Sentry.init({
      dsn: sentryEndpoint,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      release: `client-web@${import.meta.env.VITE_APP_BUILD_VERSION}`,
    });
  }
};

export default bootstrap;
