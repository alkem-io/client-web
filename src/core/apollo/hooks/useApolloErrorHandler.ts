import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Severity } from '../../state/global/notifications/notificationMachine';
import { useTranslation } from 'react-i18next';
import { error as logError } from '../../../services/logging/sentry/log';
import { useNotification } from '../../../hooks/useNotification';

enum GraphQLErrorsExtensionCodes {
  BAD_USER_INPUT = 'BAD_USER_INPUT',
}

const tryGetField = (errorMessage: string): string | undefined => {
  let matches = errorMessage?.match(/property ([\w-]+) has failed/);
  return matches ? matches[1] : undefined;
};

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const { t } = useTranslation();
  const notify = useNotification();

  const handleNetworkErrors = (error: ApolloError) => {
    const networkError = error.networkError as any;
    if (networkError && networkError.result && networkError.result.errors) {
      const error = networkError.result.errors[0] as GraphQLError;
      notify(error.message, severity);
    }
  };

  const handleGraphQLErrors = (error: ApolloError) => {
    const graphqlErrors = error.graphQLErrors;

    graphqlErrors.forEach((error: GraphQLError) => {
      switch (error.extensions?.code) {
        case GraphQLErrorsExtensionCodes.BAD_USER_INPUT: {
          const field = tryGetField(error.message);
          if (field) {
            notify(t('apollo.errors.bad-user-input-withfield', { field }), severity);
          } else {
            notify(t('apollo.errors.bad-user-input'), severity);
          }

          logError(error);
          break;
        }
      }
    });
  };

  const handleClientErrors = (error: ApolloError) => {
    if (error.clientErrors && error.clientErrors.length > 0) {
      notify(error.message, severity);
    }
  };

  return (error: ApolloError) => {
    handleNetworkErrors(error);
    handleGraphQLErrors(error);
    handleClientErrors(error);
  };
};
