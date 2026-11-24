import type { ApolloError } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';
import type { i18n, TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import type { Severity } from '@/core/state/global/notifications/useNotifications';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

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

const UUID_REGEX = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

/**
 * Strips UUIDs from a raw server error message so it can be shown to the user, cleaning up the
 * artefacts left behind (e.g. the now-empty `( )` around a removed id, doubled spaces, " ," ).
 *
 * "Unable to remove Space (6df9be66-…), with level 1, as it contains 6 subspaces"
 *   → "Unable to remove Space, with level 1, as it contains 6 subspaces"
 */
export const stripIdsFromMessage = (message: string): string =>
  message
    .replace(UUID_REGEX, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

/**
 * The translated user-facing message for one GraphQL error — the same text the global error
 * handler shows for it. For a caller that handles an operation's errors itself.
 */
export const getTranslationForCode = (error: GraphQLFormattedError, t: TFunction, i18n: i18n) => {
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

const NETWORK_ERROR_FALLBACK_KEY = 'apollo.errors.network.generic' as TranslationKey;

// "Not available": the thing may not exist, or the caller may not access it.
const NOT_AVAILABLE_ERROR_CODES: string[] = [
  AlkemioGraphqlErrorCode.FORBIDDEN,
  AlkemioGraphqlErrorCode.FORBIDDEN_POLICY,
];

export const isNotAvailableError = (error: GraphQLFormattedError) =>
  NOT_AVAILABLE_ERROR_CODES.includes(error.extensions?.code as string);

// Codes whose server message is never shown beside the translation: it adds nothing the user can act on.
const CODES_WITHOUT_DETAIL: string[] = [AlkemioGraphqlErrorCode.UNSPECIFIED, ...NOT_AVAILABLE_ERROR_CODES];

/**
 * What the global handler shows for one GraphQL error: its translation, then the server's own
 * message (ids removed) when that says something more.
 */
const getMessagesForGraphQLError = (graphqlError: GraphQLFormattedError, t: TFunction, i18n: i18n): string[] => {
  const translation = getTranslationForCode(graphqlError, t, i18n);
  const code = graphqlError.extensions?.code as string;
  const detail = stripIdsFromMessage(graphqlError.message);
  const hasDetail = detail && detail !== translation && !CODES_WITHOUT_DETAIL.includes(code);
  return hasDetail ? [translation, detail] : [translation];
};

/**
 * For a caller that opts out of the global handler (OWN_ERROR_HANDLING) because it shows some
 * failures its own way: the one message for any other failure. It is what the global handler would
 * have shown for the first GraphQL error, preferring one that says more than "not available", so the
 * server's reason still reaches the user. `fallback` is for a failure that carries no GraphQL error,
 * such as a lost connection or a failure before the request was sent.
 */
export const useServerErrorMessage = () => {
  const { t, i18n } = useTranslation();

  return (error: unknown, fallback: string): string => {
    const graphQLErrors = ((error as ApolloError | undefined)?.graphQLErrors ?? []).filter(
      graphqlError => graphqlError.extensions?.code !== AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR
    );
    const reported = graphQLErrors.find(graphqlError => !isNotAvailableError(graphqlError)) ?? graphQLErrors[0];
    return reported ? getMessagesForGraphQLError(reported, t, i18n).join(' ') : fallback;
  };
};

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const { t, i18n } = useTranslation();
  const notify = useNotification();

  const notifyGraphQLError = (graphqlError: GraphQLFormattedError) => {
    const numericCode = graphqlError.extensions?.numericCode as number | undefined;
    for (const message of getMessagesForGraphQLError(graphqlError, t, i18n)) {
      notify(message, severity, numericCode);
    }
  };

  const handleNetworkErrors = (error: ApolloError) => {
    const networkError = error.networkError;
    if (!networkError) return;

    if ('result' in networkError && typeof networkError.result === 'object' && networkError.result !== null) {
      if (Array.isArray(networkError.result.errors) && networkError.result.errors.length > 0) {
        (networkError.result.errors as GraphQLFormattedError[]).forEach(notifyGraphQLError);
        return;
      }

      const result = networkError.result as Record<string, unknown>;
      if (typeof result.error === 'string') {
        const key = `apollo.errors.network.${result.error}` as TranslationKey;
        notify(i18n.exists(key) ? t(key) : t(NETWORK_ERROR_FALLBACK_KEY), severity);
        return;
      }
    }

    // Reaching here means the request produced no server payload that could explain itself.
    // While the browser reports itself offline that is expected, and it is already shown by the
    // persistent online-status banner, so a generic error toast per failed operation only repeats
    // what the user can see — in bursts, since every in-flight operation fails at once.
    // A failure while the browser believes it is online is a different matter: the server may be
    // unreachable with no other signal to the user, so that one is still surfaced.
    if (!navigator.onLine) {
      return;
    }

    notify(t(NETWORK_ERROR_FALLBACK_KEY), severity);
  };

  const handleGraphQLErrors = (error: ApolloError) => {
    error.graphQLErrors.forEach(notifyGraphQLError);
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
  if (error?.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.ENTITY_NOT_FOUND);
  }
  return false;
};

export const isApolloForbiddenPolicyError = (error: ApolloError | undefined) => {
  if (error?.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.FORBIDDEN_POLICY);
  }
  return false;
};

export const isApolloAuthorizationError = (error: ApolloError | undefined) =>
  Boolean(error?.graphQLErrors?.some(isNotAvailableError));

export const isUrlResolverError = (error: ApolloError | undefined) => {
  if (error?.graphQLErrors) {
    const extensions = error.graphQLErrors.map(graphQLError => graphQLError.extensions);
    return extensions.some(extension => extension?.code === AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR);
  }
  return false;
};
