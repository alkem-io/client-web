import * as Sentry from '@sentry/react';
import { FC } from 'react';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import sentryBootstrap from '@/core/logging/sentry/bootstrap';
import { useConfig } from '@/domain/platform/config/useConfig';

const SentryErrorBoundaryProvider: FC = ({ children }) => {
  const { sentry } = useConfig();
  sentryBootstrap(sentry?.enabled, sentry?.endpoint, sentry?.environment);

  return <Sentry.ErrorBoundary fallback={({ error }) => <ErrorPage error={error} />}>{children}</Sentry.ErrorBoundary>;
};

export default SentryErrorBoundaryProvider;
