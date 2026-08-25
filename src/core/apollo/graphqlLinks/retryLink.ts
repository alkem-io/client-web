import type { Operation } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition } from '@apollo/client/utilities';

// any is in Apollo types
export const retryIf = (error: any, operation: Operation) => {
  // Never auto-retry mutations. They are not idempotent, so retrying after a
  // slow-but-successful first attempt double-submits the operation. This bit us
  // on deleteCallout: deleting a Tasks board is slow (it removes every
  // contribution, its task tagset, and the standalone column template in turn),
  // so the first request network-errors client-side while the server completes
  // the delete; the retry then hits the already-deleted callout and surfaces
  // ENTITY_NOT_FOUND even though the delete succeeded. Queries stay retryable.
  const definition = getMainDefinition(operation.query);
  if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
    return false;
  }

  const doNotRetryCodes = [500, 400, 401, 403];
  return !!error && !doNotRetryCodes.includes(error.statusCode) && !error.response?.redirected;
};

export const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf,
  },
});
