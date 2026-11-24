import { ApolloError, type Operation } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { useMemo, useRef } from 'react';
import { routeToSecondFactor } from '@/core/auth/authentication/routeToSecondFactor';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import { isNotAvailableError, useApolloErrorHandler } from '../hooks/useApolloErrorHandler';

const getOperationType = (operation: Operation) => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition' ? definition.operation : undefined;
};

export const useErrorHandlerLink = () => {
  const handleError = useApolloErrorHandler();
  const handleErrorRef = useRef(handleError);
  handleErrorRef.current = handleError;

  // onError() is an external library call the React Compiler cannot auto-memoize.
  // Use the "latest ref" pattern: create the link once, always call the latest handler.
  return useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation }) => {
        // A session refused for a missing second factor is routed to /second-factor, whose page is
        // the one notice. Checked before the opt-out below: an operation that handles its own errors
        // must still not leave the person on a page every request of which is refused.
        if (graphQLErrors?.some(error => error.extensions?.code === AlkemioGraphqlErrorCode.SECOND_FACTOR_REQUIRED)) {
          routeToSecondFactor();
          return;
        }

        // An operation whose caller shows its own message, or none (OWN_ERROR_HANDLING).
        const { skipGlobalErrorHandler } = operation.getContext();
        if (skipGlobalErrorHandler) {
          return;
        }

        // "Not available": the thing may not exist, or the caller may not access it. For a mutation,
        // the user's own action, the first one in a response is reported and the rest are dropped, so
        // the action gets one message however many errors carry it. For a query or subscription, which
        // loads something to display, they are all dropped: the screen renders without that part or
        // shows its own state.
        const operationType = getOperationType(operation);
        const reportedNotAvailableIndex =
          operationType === 'mutation' ? (graphQLErrors?.findIndex(isNotAvailableError) ?? -1) : -1;

        const reportableGraphqlErrors = graphQLErrors?.filter((error, index) => {
          if (error.extensions?.code === AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR) {
            return false;
          }
          return !isNotAvailableError(error) || index === reportedNotAvailableIndex;
        });

        // A subscription losing its transport is not a user-facing failure: nothing the user did
        // failed, the view keeps the data it already has, and graphql-ws reconnects on its own.
        // Reporting it meant one toast per live subscription every time the socket dropped — and
        // several subscriptions are always open, so a single blip produced a burst of identical
        // toasts. The socket error itself is still reported to Sentry where the ws link is built.
        // A subscription's GraphQL errors (e.g. an authorization refusal) are still surfaced.
        const reportableNetworkError = operationType === 'subscription' ? undefined : networkError;

        handleErrorRef.current(
          new ApolloError({
            graphQLErrors: reportableGraphqlErrors,
            networkError: reportableNetworkError,
            extraInfo: 'Error caught from the errorReporterLink',
          })
        );
      }),
    []
  );
};
