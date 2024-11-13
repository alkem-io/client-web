import { onError } from '@apollo/client/link/error';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';
import { AlkemioGraphqlErrorCode } from '@main/constants/errors';

export const useErrorHandlerLink = () => {
  const handleError = useApolloErrorHandler();

  return onError(({ graphQLErrors, networkError }) => {
    // dont report the forbidden errors
    const nonForbiddenGraphqlErrors = graphQLErrors?.filter(
      x => x.extensions.code !== AlkemioGraphqlErrorCode.FORBIDDEN
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
