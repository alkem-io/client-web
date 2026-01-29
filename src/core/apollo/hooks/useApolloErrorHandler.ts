import { Severity } from '@/core/state/global/notifications/notificationMachine';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ApolloError } from '@apollo/client';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import type { TFunction, i18n } from 'i18next';
import { useTranslation } from 'react-i18next';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

/**
 * Attempts to translate using the server-provided userMessage as an i18n key.
 * The userMessage from the server is expected to be a partial key (e.g., "userMessages.validation.invalidStateTransition")
 * which gets prefixed with "apollo.errors." to form the full i18n key.
 * Returns the translated message if the key exists, otherwise returns undefined.
 */
const getTranslationForUserMessage = (
  userMessage: string | undefined,
  t: TFunction,
  i18n: i18n,
  meta: Record<string, unknown>
): string | undefined => {
  if (!userMessage) {
    return undefined;
  }

  // Server sends partial keys like "userMessages.validation.invalidStateTransition"
  // Full i18n keys are under "apollo.errors.userMessages.*"
  const key = `apollo.errors.${userMessage}` as TranslationKey;
  if (i18n.exists(key)) {
    return t(key, meta);
  }

  return undefined;
};

const getTranslationForCode = (error: GraphQLFormattedError, t: TFunction, i18n: i18n) => {
  const { message } = error;
  const code = error.extensions?.code as string;
  const userMessage = error.extensions?.userMessage as string | undefined;
  const numericCode = error.extensions?.numericCode as number | undefined;
  const meta = { code, message, errorId: numericCode };

  // First, try to use userMessage as an i18n key (server-provided translation key)
  const userMessageTranslation = getTranslationForUserMessage(userMessage, t, i18n, meta);
  if (userMessageTranslation) {
    return userMessageTranslation;
  }

  // Fall back to existing code-based translation logic
  if (!code) {
    // if code missing send a generic error text
    return t('apollo.errors.generic', meta);
  }

  const key = `apollo.errors.${code}` as TranslationKey;

  if (!i18n.exists(key)) {
    // if the error text is missing for that code
    // send a generic error text with code
    return t('apollo.errors.generic-with-code', meta);
  }
  // send the error text
  return t(key, meta);
};

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const { t, i18n } = useTranslation();
  const notify = useNotification();

  const handleNetworkErrors = (error: ApolloError) => {
    const networkError = error.networkError;
    if (
      networkError &&
      'result' in networkError &&
      typeof networkError.result === 'object' &&
      'errors' in networkError.result &&
      networkError.result.errors
    ) {
      const error = networkError.result.errors[0] as GraphQLError;
      notify(error.message, severity);
    }
  };

  const handleGraphQLErrors = (error: ApolloError) => {
    const graphqlErrors = error.graphQLErrors;

    graphqlErrors.forEach((graphqlError: GraphQLFormattedError) => {
      const translation = getTranslationForCode(graphqlError, t, i18n);
      const numericCode = graphqlError.extensions?.numericCode as number | undefined;
      notify(translation, severity, numericCode);
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

export const isApolloNotFoundError = (error: ApolloError | undefined) => {
  if (error && error.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.ENTITY_NOT_FOUND);
  }
  return false;
};

export const isApolloForbiddenError = (error: ApolloError | undefined) => {
  if (error && error.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.FORBIDDEN);
  }
  return false;
};

export const isApolloForbiddenPolicyError = (error: ApolloError | undefined) => {
  if (error && error.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.FORBIDDEN_POLICY);
  }
  return false;
};

export const isApolloAuthorizationError = (error: ApolloError | undefined) => {
  return error && (isApolloForbiddenError(error) || isApolloForbiddenPolicyError(error));
};

export const isUrlResolverError = (error: ApolloError | undefined) => {
  if (error && error.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR);
  }
  return false;
};
