import { ApolloLink } from '@apollo/client';

export const consoleLink = (debugQuery = false) =>
  new ApolloLink((operation, forward) => {
    if (!debugQuery) {
      return forward(operation);
    }

    console.info(`starting request for ${operation.operationName}`);

    return forward(operation).map(data => {
      console.info(`ending request for ${operation.operationName}`);
      return data;
    });
  });
