import { onError } from '@apollo/client/link/error';
import { logger } from '../../services/logging/winston/logger';

export const errorLink = (errorLogging = false) =>
  onError(({ graphQLErrors, networkError, forward, operation }) => {
    if (!errorLogging) {
      return forward(operation);
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

    return forward(operation);
  });
