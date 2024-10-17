import React from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import * as Sentry from '@sentry/react';

const DEFAULT_ENVIRONMENT = 'development';

const reactRouterV6BrowserTracingIntegration = new Sentry.BrowserTracing({
  routingInstrumentation: Sentry.reactRouterV6Instrumentation(
    React.useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes
  ),
});

const bootstrap = (sentryEnabled?: boolean, sentryEndpoint?: string, environment?: string) => {
  if (sentryEnabled && sentryEndpoint) {
    Sentry.init({
      dsn: sentryEndpoint,
      integrations: [reactRouterV6BrowserTracingIntegration],
      tracesSampleRate: 1.0,
      environment: environment ?? DEFAULT_ENVIRONMENT,
      release: `client-web@${import.meta.env.VITE_APP_BUILD_VERSION}`,
    });
  }
};

export default bootstrap;
