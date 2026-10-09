import { ApolloError, type Operation } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { useMemo, useRef } from 'react';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';

// Don't report these errors in the bottom right corner
const EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS = [
  AlkemioGraphqlErrorCode.FORBIDDEN,
  AlkemioGraphqlErrorCode.FORBIDDEN_POLICY,
  AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR,
];

const isSubscription = (operation: Operation) => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
};

export const useErrorHandlerLink = () => {
  const handleError = useApolloErrorHandler();
  const handleErrorRef = useRef(handleError);
  handleErrorRef.current = handleError;

  // onError() is an external library call the React Compiler cannot auto-memoize.
  // Use the "latest ref" pattern: create the link once, always call the latest handler.
  // eslint-disable-next-line no-restricted-syntax -- Apollo onError link must be created once; a new link identity each render rebuilds the client's link chain.
  return useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation }) => {
        // Check if this operation should skip global error handling
        const { skipGlobalErrorHandler } = operation.getContext();
        if (skipGlobalErrorHandler) {
          return;
        }

        const nonForbiddenGraphqlErrors = graphQLErrors?.filter(
          x => !EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS.includes(x.extensions?.code as AlkemioGraphqlErrorCode)
        );

        // A subscription losing its transport is not a user-facing failure: nothing the user did
        // failed, the view keeps the data it already has, and graphql-ws reconnects on its own.
        // Reporting it meant one toast per live subscription every time the socket dropped — and
        // several subscriptions are always open, so a single blip produced a burst of identical
        // toasts. The socket error itself is still reported to Sentry where the ws link is built.
        // A subscription's GraphQL errors (e.g. an authorization refusal) are still surfaced.
        const reportableNetworkError = isSubscription(operation) ? undefined : networkError;

        handleErrorRef.current(
          new ApolloError({
            graphQLErrors: nonForbiddenGraphqlErrors,
            networkError: reportableNetworkError,
            extraInfo: 'Error caught from the errorReporterLink',
          })
        );
      }),
    []
  );
};
