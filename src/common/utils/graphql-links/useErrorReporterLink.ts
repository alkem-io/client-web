import { onError } from '@apollo/client/link/error';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';

export const useErrorReporterLink = () => {
  const handleError = useApolloErrorHandler();

  return onError(({ graphQLErrors, networkError }) => {
    handleError(
      new ApolloError({
        graphQLErrors,
        networkError,
        extraInfo: 'Error caught from the errorReporterLink',
      })
    );
  });
};
