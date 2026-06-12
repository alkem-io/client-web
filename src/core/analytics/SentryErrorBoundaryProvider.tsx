import * as Sentry from '@sentry/react';
import type { PropsWithChildren } from 'react';
import sentryBootstrap from '@/core/logging/sentry/bootstrap';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { useConfig } from '@/domain/platform/config/useConfig';
import { CrdTopLevelErrorPage } from '@/main/crdPages/error/CrdTopLevelErrorPage';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';

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
 * Top-level (above-router) error fallback. CRD users get a bare CRD error page;
 * legacy users get the MUI `ErrorPage`. `useCrdEnabled()` reads localStorage
 * only, so it is safe here despite the absence of router/Apollo context.
 */
const TopLevelErrorFallback = ({ error }: { error: unknown }) => {
  const crdEnabled = useCrdEnabled();
  const numericCode = extractNumericCode(error);

  if (crdEnabled) {
    return <CrdTopLevelErrorPage error={error as Error} numericCode={numericCode} />;
  }
  return <ErrorPage error={error as Error} numericCode={numericCode} />;
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
