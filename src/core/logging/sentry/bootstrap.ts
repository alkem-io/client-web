import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import { appPlatform, isAppMode } from '@/core/appMode/isAppMode';
import { hasAnalysisConsent } from '@/main/cookies/useAlkemioCookies';

const DEFAULT_ENVIRONMENT = 'development';
const CONSENTED_TRACES_SAMPLE_RATE = 0.2;

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
      // Tracing, breadcrumbs and sessions need `analysis` consent; error events do not. Each hook
      // reads the cookie when it runs, so a changed choice applies without a reload.
      tracesSampler: () => (hasAnalysisConsent() ? CONSENTED_TRACES_SAMPLE_RATE : 0),
      beforeBreadcrumb: breadcrumb => (hasAnalysisConsent() ? breadcrumb : null),
      // Breadcrumbs kept while consent was given stay on the scope after a withdrawal.
      beforeSend: event => (hasAnalysisConsent() ? event : { ...event, breadcrumbs: undefined }),
      // Sentry 9 has no beforeSendSession, and every session envelope (on load, per navigation, on
      // an error) leaves through the transport, so the transport drops them without consent. A
      // session envelope carries the session as its only item.
      transport: options => {
        const transport = Sentry.makeFetchTransport(options);
        return {
          ...transport,
          send: envelope =>
            !hasAnalysisConsent() && envelope[1][0]?.[0].type === 'session'
              ? Promise.resolve({})
              : transport.send(envelope),
        };
      },
      environment: environment ?? DEFAULT_ENVIRONMENT,
      release: `client-web@${import.meta.env.VITE_BUILD_VERSION}`,
      initialScope: { tags: { app_mode: isAppMode(), app_platform: appPlatform() } },
    });
  }
};

export default bootstrap;
