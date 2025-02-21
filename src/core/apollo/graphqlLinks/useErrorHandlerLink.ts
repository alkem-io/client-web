import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import { ApolloError } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';

// Don't report these errors in the bottom right corner
const EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS = [
  AlkemioGraphqlErrorCode.FORBIDDEN,
  AlkemioGraphqlErrorCode.URL_RESOLVER_ERROR,
];

export const useErrorHandlerLink = () => {
  const handleError = useApolloErrorHandler();

  return onError(({ graphQLErrors, networkError }) => {
    const nonForbiddenGraphqlErrors = graphQLErrors?.filter(
      x => !EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS.includes(x.extensions?.code as AlkemioGraphqlErrorCode)
    );
    handleError(
      new ApolloError({
        graphQLErrors: nonForbiddenGraphqlErrors,
        networkError,
        extraInfo: 'Error caught from the errorReporterLink',
      })
    );
  });
};
