import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { i18n, TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Severity } from '../../state/global/notifications/notificationMachine';
import { error as logError } from '../../../services/logging/sentry/log';
import { useNotification } from '../../ui/notifications/useNotification';

const getTranslationForCode = (error: GraphQLError, t: TFunction, i18n: i18n) => {
  const code = error.extensions?.code as string;
  if (!code) {
    // if code missing send a generic error text
    return t('apollo.errors.generic');
  }

  const key = `apollo.errors.${code}`;

  if (!i18n.exists(key)) {
    // if the error text is missing for that code
    // send a generic error text with code
    return t('apollo.errors.generic-with-code', { code });
  }
  // send the error text
  return t(key);
};

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const { t, i18n } = useTranslation();
  const notify = useNotification();

  const handleNetworkErrors = (error: ApolloError) => {
    const networkError = error.networkError;
    if (networkError && 'result' in networkError && networkError.result && networkError.result.errors) {
      const error = networkError.result.errors[0] as GraphQLError;
      notify(error.message, severity);
    }
  };

  const handleGraphQLErrors = (error: ApolloError) => {
    const graphqlErrors = error.graphQLErrors;

    graphqlErrors.forEach((error: GraphQLError) => {
      const translation = getTranslationForCode(error, t, i18n);
      notify(translation, severity);

      logError(error);
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
