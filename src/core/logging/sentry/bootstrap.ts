import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';

const DEFAULT_ENVIRONMENT = 'development';

const reactRouterV6BrowserTracingIntegration = Sentry.reactRouterV6BrowserTracingIntegration({
  useEffect,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
});

// Called from SentryErrorBoundaryProvider's render body, so it runs on every re-render. Each
// Sentry.init adds another global fetch instrumentation handler, which records every request N
// times and surfaces as bogus "N+1 API Call" issues — so initialise only once.
const bootstrap = (sentryEnabled?: boolean, sentryEndpoint?: string, environment?: string) => {
  if (sentryEnabled && sentryEndpoint && !Sentry.isInitialized()) {
    Sentry.init({
      dsn: sentryEndpoint,
      integrations: [reactRouterV6BrowserTracingIntegration],
      tracesSampleRate: 1.0,
      environment: environment ?? DEFAULT_ENVIRONMENT,
      release: `client-web@${import.meta.env.VITE_BUILD_VERSION}`,
    });
  }
};

export default bootstrap;
