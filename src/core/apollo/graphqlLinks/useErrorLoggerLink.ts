import { onError } from '@apollo/client/link/error';
import { useMemo, useRef } from 'react';
import { useApm } from '@/core/analytics/apm/context';
import { error as sentryError, TagCategoryValues } from '@/core/logging/sentry/log';

const getErrorCode = (error: Error & { extensions?: { code?: string } }) => {
  return error?.extensions?.code ?? undefined;
};

const getErrorMessage = (error: Error) => {
  return error?.message ?? undefined;
};

/**
 * This function is called after the GraphQL operation completes and execution is moving back up your link chain. i.e. a response is received
 * The function should not return a value unless you want to retry the operation.
 */
export const useErrorLoggerLink = (errorLogging = false) => {
  const apm = useApm();
  const apmRef = useRef(apm);
  apmRef.current = apm;

  const errorLoggingRef = useRef(errorLogging);
  errorLoggingRef.current = errorLogging;

  // onError() is an external library call the React Compiler cannot auto-memoize.
  // Use the "latest ref" pattern: create the link once, always call the latest values.
  return useMemo(
    () =>
      onError(({ graphQLErrors, networkError }) => {
        if (!errorLoggingRef.current) {
          return;
        }

        const errors: Error[] = [];
        if (graphQLErrors) {
          errors.push(...(graphQLErrors as Error[]));
        }

        if (networkError) {
          networkError.message = `[Network error]: ${networkError.message}`;
          errors.push(networkError);
        }

        errors.forEach(e => {
          sentryError(e, { category: TagCategoryValues.SERVER, code: getErrorCode(e), label: getErrorMessage(e) });
          apmRef.current?.captureError(e);
        });
      }),
    []
  );
};
