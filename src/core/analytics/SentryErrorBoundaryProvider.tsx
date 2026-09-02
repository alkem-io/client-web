import * as Sentry from '@sentry/react';
import type { PropsWithChildren } from 'react';
import sentryBootstrap from '@/core/logging/sentry/bootstrap';
import { useConfig } from '@/domain/platform/config/useConfig';
import { CrdTopLevelErrorPage } from '@/main/crdPages/error/CrdTopLevelErrorPage';

/**
 * Extracts numericCode from an error if it exists as a property.
 * This allows custom errors with numericCode to display the code in the error page.
 */
const extractNumericCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'numericCode' in error) {
    const code = (error as { numericCode: unknown }).numericCode;
    return Number.isFinite(code) ? (code as number) : undefined;
  }
  return undefined;
};

/**
 * Top-level (above-router) error fallback. Renders the bare CRD error page.
 */
const TopLevelErrorFallback = ({ error }: { error: unknown }) => {
  const numericCode = extractNumericCode(error);
  return <CrdTopLevelErrorPage error={error as Error} numericCode={numericCode} />;
};

const SentryErrorBoundaryProvider = ({ children }: PropsWithChildren) => {
  const { sentry } = useConfig();
  sentryBootstrap(sentry?.enabled, sentry?.endpoint, sentry?.environment);

  return (
    <Sentry.ErrorBoundary fallback={({ error }: { error: unknown }) => <TopLevelErrorFallback error={error} />}>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundaryProvider;
