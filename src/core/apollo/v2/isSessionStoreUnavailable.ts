import type { ApolloError } from '@apollo/client';

export const isInvalidSession = (error: ApolloError | undefined): boolean => {
  const network = error?.networkError;
  return !!network && 'statusCode' in network && network.statusCode === 401;
};

// A failed session lookup is not an anonymous viewer or an expired session.
export const isSessionStoreUnavailable = (error: ApolloError | undefined): boolean => {
  const network = error?.networkError;
  if (!network || !('statusCode' in network) || network.statusCode !== 503 || !('result' in network)) return false;
  const result = network.result;
  if (!result || typeof result !== 'object') return false;
  if ('error' in result && result.error === 'session_store_unavailable') return true;
  return (
    'errors' in result &&
    Array.isArray(result.errors) &&
    result.errors.some(error => error?.extensions?.code === 'SESSION_STORE_UNAVAILABLE')
  );
};
