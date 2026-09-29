import type { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

const AUTHORIZATION_ERROR_CODES: string[] = [
  AlkemioGraphqlErrorCode.FORBIDDEN,
  AlkemioGraphqlErrorCode.FORBIDDEN_POLICY,
];

/**
 * True when the rejection consists of NOTHING BUT authorization errors.
 *
 * Deliberately whole-response, not "contains an authorization error". The global link
 * (`useErrorHandlerLink`) strips the authorization codes and forwards whatever remains to
 * `useApolloErrorHandler`, so it stays silent only when the filtered list is empty. If a
 * response mixes, say, FORBIDDEN with ENTITY_NOT_FOUND, the global handler already
 * notifies for the latter — notifying here as well would give the user two toasts for one
 * failure, which spec FR-006 forbids.
 *
 * The precedence is therefore: any non-authorization content in the response (a GraphQL
 * error with another code, a network error, or a client error) hands ownership to the
 * global handler and this wrapper says nothing.
 */
export const isExclusivelyAuthorizationError = (error: unknown): boolean => {
  const apolloError = error as ApolloError | undefined;
  const graphQLErrors = apolloError?.graphQLErrors;

  if (!graphQLErrors?.length) {
    return false;
  }

  if (apolloError?.networkError || apolloError?.clientErrors?.length) {
    return false;
  }

  return graphQLErrors.every(graphqlError =>
    AUTHORIZATION_ERROR_CODES.includes(graphqlError.extensions?.code as string)
  );
};

/**
 * FORBIDDEN/FORBIDDEN_POLICY are excluded from the global toast (useErrorHandlerLink.ts:8-12);
 * this is the one place that surfaces them. Wrap a mutation call with the returned `guard` so a
 * permission-denied rejection gets a single toast; every other failure class is already reported
 * by the global error link. The rejection is always re-thrown so callers keep control flow.
 */
export const usePermissionDeniedNotifier = () => {
  const notify = useNotification();
  const { t } = useTranslation('crd-common');

  return <T>(run: () => Promise<T>): Promise<T> =>
    run().catch((error: unknown) => {
      if (isExclusivelyAuthorizationError(error)) {
        notify(t('permissions.errorDenied'), 'error');
      }
      throw error;
    });
};
