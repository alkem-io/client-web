import type { ApolloError } from '@apollo/client';
import { useEffect } from 'react';
import { useApolloErrorHandler } from './useApolloErrorHandler';

/**
 * A section's failed read, reported once through the shared handler while the section renders without its data —
 * as legacy's global error link did, so one failing section never takes down the others on the page.
 */
export const useReportedQueryError = (error: ApolloError | undefined) => {
  const handleError = useApolloErrorHandler();
  useEffect(() => {
    if (error) handleError(error);
  }, [error]);
};
