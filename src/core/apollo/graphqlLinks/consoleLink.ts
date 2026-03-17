import { ApolloLink } from '@apollo/client';

export const consoleLink = (debugQuery = false) =>
  new ApolloLink((operation, forward) => {
    if (!debugQuery) {
      return forward(operation);
    }

    return forward(operation).map(data => {
      return data;
    });
  });
