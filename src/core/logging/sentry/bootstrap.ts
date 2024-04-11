import React from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

const reactRouterV6BrowserTracingIntegration = new Integrations.BrowserTracing({
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
      integrations: [new Integrations.BrowserTracing(), reactRouterV6BrowserTracingIntegration],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      release: `client-web@${import.meta.env.VITE_APP_BUILD_VERSION}`,
    });
  }
};

export default bootstrap;
