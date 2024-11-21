import { ApolloError } from '@apollo/client';
import { isApolloNotFoundError } from '../hooks/useApolloErrorHandler';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';

interface WithOptionalError {
  error?: ApolloError;
}

const mainQuery =
  <Args extends unknown[], Result extends WithOptionalError>(fn: (...args: Args) => Result) =>
  (...args: Args) => {
    const result = fn(...args);

    if (isApolloNotFoundError(result.error)) {
      throw new NotFoundError();
    }

    return result;
  };

export default mainQuery;
