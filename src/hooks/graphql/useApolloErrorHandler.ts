import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Severity } from '../../state/global/notifications/notificationMachine';

import { useNotification } from '../useNotification';

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const notify = useNotification();
  return (error: ApolloError) => {
    const networkError = error.networkError;
    if (!networkError) {
      return;
    }

    if (isServerError(networkError)) {
      const graphqlError = networkError.result.errors[0] as GraphQLError;
      notify(graphqlError.message, severity);
    } else if (isServerParseError(networkError)) {
      notify(networkError.bodyText, severity);
    } else {
      notify(error.message, severity);
    }
  };
};

const isServerParseError = (error: unknown): error is ServerParseError => 'bodyText' in (error as ServerParseError);
const isServerError = (error: unknown): error is ServerError => 'result' in (error as ServerError);
