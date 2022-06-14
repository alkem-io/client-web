import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Severity } from '../../state/global/notifications/notificationMachine';
import { useTranslation } from 'react-i18next';
import { error as logError } from '../../services/logging/sentry/log';
import { useNotification } from '../useNotification';

enum GraphQLErrorsExtensionCodes {
  BAD_USER_INPUT = 'BAD_USER_INPUT',
}

const tryGetField = (errorMessage: string): string | undefined => {
  let matches = errorMessage?.match(/property ([A-Za-z0-9_-]+) has failed/);
  if (matches && matches.length === 2) {
    return matches[1];
  }
};

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const { t } = useTranslation();
  const notify = useNotification();

  const handleNetworkErrors = (error: ApolloError) => {
    const networkError = error.networkError as any;
    if (networkError && networkError.result && networkError.result.errors) {
      const error = networkError.result.errors[0] as GraphQLError;
      notify(error.message, severity);
      return true;
    }
    return false;
  };

  const handleGraphQLErrors = (error: ApolloError) => {
    const graphqlErrors = error.graphQLErrors;

    let allHandled = true;
    graphqlErrors.forEach((error: GraphQLError) => {
      switch (error.extensions?.code) {
        case GraphQLErrorsExtensionCodes.BAD_USER_INPUT: {
          let field = tryGetField(error.message);
          if (field) {
            notify(t('apollo.errors.bad-user-input-withfield', { field }), severity);
          } else {
            notify(t('apollo.errors.bad-user-input'), severity);
          }

          logError(error);
          allHandled = allHandled && true;
          break;
        }
        default:
          allHandled = false;
      }
    });
    return allHandled;
  };

  const handleClientErrors = (error: ApolloError) => {
    notify(error.message, severity);
    return true;
  };

  return (error: ApolloError) => {
    if (error.networkError && handleNetworkErrors(error)) {
      // On network errors do nothing but notify the user
      return;
    } else {
      if (error.graphQLErrors) {
        handleGraphQLErrors(error);
      } else if (error.clientErrors) {
        handleClientErrors(error);
      } else {
        notify(error.message, severity);
      }
    }
  };
};
