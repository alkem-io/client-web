import sentryBootstrap from '@/core/logging/sentry/bootstrap';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { useConfig } from '@/domain/platform/config/useConfig';
import * as Sentry from '@sentry/react';
import { PropsWithChildren } from 'react';

/**
 * Extracts numericCode from an error if it exists as a property.
 * This allows custom errors with numericCode to display the code in the error page.
 */
const extractNumericCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'numericCode' in error) {
    const code = (error as { numericCode: unknown }).numericCode;
    return typeof code === 'number' ? code : undefined;
  }
  return undefined;
};

const SentryErrorBoundaryProvider = ({ children }: PropsWithChildren) => {
  const { sentry } = useConfig();
  sentryBootstrap(sentry?.enabled, sentry?.endpoint, sentry?.environment);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error }: { error: unknown }) => (
        <ErrorPage error={error as Error} numericCode={extractNumericCode(error)} />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundaryProvider;
