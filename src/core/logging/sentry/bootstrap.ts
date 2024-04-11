import React from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import * as Sentry from '@sentry/react';

const reactRouterV6BrowserTracingIntegration = new Sentry.BrowserTracing({
  routingInstrumentation: Sentry.reactRouterV6Instrumentation(
    React.useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes
  ),
});

const bootstrap = (sentryEnabled?: boolean, sentryEndpoint?: string) => {
  if (sentryEnabled && sentryEndpoint) {
    Sentry.init({
      dsn: sentryEndpoint,
      integrations: [reactRouterV6BrowserTracingIntegration],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      release: `client-web@${import.meta.env.VITE_APP_BUILD_VERSION}`,
    });
  }
};

export default bootstrap;
