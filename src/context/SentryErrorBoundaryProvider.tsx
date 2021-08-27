import * as Sentry from '@sentry/react';
import React, { FC } from 'react';
import { Error as ErrorPage } from '../pages/Error';
import sentryBootstrap from '../services/logging/sentry/bootstrap';
import { useConfig } from '../hooks';

const SentryErrorBoundaryProvider: FC = ({ children }) => {
  const { sentry } = useConfig();
  sentryBootstrap(sentry?.enabled, sentry?.endpoint);

  return <Sentry.ErrorBoundary fallback={({ error }) => <ErrorPage error={error} />}>{children}</Sentry.ErrorBoundary>;
};
export default SentryErrorBoundaryProvider;
