import { ApolloLink } from '@apollo/client';
import { logger } from '../../../services/logging/winston/logger';

export const consoleLink = (debugQuery = false) =>
  new ApolloLink((operation, forward) => {
    if (!debugQuery) {
      return forward(operation);
    }

    logger.info(`starting request for ${operation.operationName}`);

    return forward(operation).map(data => {
      logger.info(`ending request for ${operation.operationName}`);
      return data;
    });
  });
