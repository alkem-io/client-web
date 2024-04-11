import { onError } from '@apollo/client/link/error';
import { error as sentryError, tagCategoryValues, tagKeys } from '../../logging/sentry/log';
import { useApm } from '../../analytics/apm/context';

/**
 * This function is called after the GraphQL operation completes and execution is moving back up your link chain. i.e. a response is received
 * The function should not return a value unless you want to retry the operation.
 */
export const useErrorLoggerLink = (errorLogging = false) => {
  const apm = useApm();

  return onError(({ graphQLErrors, networkError }) => {
    if (!errorLogging) {
      return;
    }

    const errors: Error[] = [];
    if (graphQLErrors) {
      errors.push(...graphQLErrors);
    }

    if (networkError) {
      networkError.message = `[Network error]: ${networkError.message}`;
      errors.push(networkError);
    }

    errors.forEach(e => {
      sentryError(e, { [tagKeys.CATEGORY]: tagCategoryValues.SERVER });
      apm?.captureError(e);
    });
  });
};
