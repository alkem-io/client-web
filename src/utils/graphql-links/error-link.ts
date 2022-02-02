import { onError } from '@apollo/client/link/error';
import { logger } from '../../services/logging/winston/logger';

/**
 * This function is called after the GraphQL operation completes and execution is moving back up your link chain
 * The function should not return a value unless you want to retry the operation.
 */
export const errorLink = (errorLogging = false) =>
  onError(({ graphQLErrors, networkError }) => {
    if (!errorLogging) {
      return;
    }

    const errors: Error[] = [];
    if (graphQLErrors) {
      const errorArray = graphQLErrors.map(x => new Error(x.message));
      errors.push(...errorArray);
    }

    if (networkError) {
      const newMessage = `[Network error]: ${networkError}`;
      errors.push(new Error(newMessage));
    }

    errors.forEach(e => logger.error(e));
  });
