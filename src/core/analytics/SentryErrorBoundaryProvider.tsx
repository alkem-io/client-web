import sentryBootstrap from '@/core/logging/sentry/bootstrap';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { useConfig } from '@/domain/platform/config/useConfig';
import * as Sentry from '@sentry/react';
import { FC, PropsWithChildren } from 'react';

const SentryErrorBoundaryProvider: FC<PropsWithChildren> = ({ children }) => {
  const { sentry } = useConfig();
  sentryBootstrap(sentry?.enabled, sentry?.endpoint, sentry?.environment);

  return <Sentry.ErrorBoundary fallback={({ error }) => <ErrorPage error={error} />}>{children}</Sentry.ErrorBoundary>;
};

export default SentryErrorBoundaryProvider;
