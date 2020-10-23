import { onError } from '@apollo/client/link/error';
import { ApolloLink, createHttpLink, from, InMemoryCache, NormalizedCacheObject, Operation } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { setContext } from '@apollo/client/link/context';
import { useDispatch, useSelector } from 'react-redux';
import { RetryLink } from '@apollo/client/link/retry';
import { RootState } from '../reducers';
import { pushError } from '../reducers/error/actions';

export const useGraphQLClient = (
  graphQLEndpoint: string,
  enableAuthentication: boolean
): ApolloClient<NormalizedCacheObject> => {
  const token = useSelector<RootState, string | null>(state => state.auth.accessToken);
  const dispatch = useDispatch();

  console.log('Token: ', token);

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    let errors: Error[] = [];

    if (graphQLErrors) {
      errors = graphQLErrors.reduce<Error[]>((acc, { message, extensions }) => {
        const newMessage = `[GraphQL error]: ${message}`;
        console.log(newMessage);

        const code = extensions && extensions['code'];
        if (code === 'UNAUTHENTICATED') {
          return acc;
        }

        acc.push(new Error(newMessage));
        return acc;
      }, []);
    }

    if (networkError) {
      // TODO [ATS] handle network errors better;
      const newMessage = `[Network error]: ${networkError}`;
      console.log(newMessage);
      // errors.push(new Error(newMessage));
    }
    errors.forEach(e => dispatch(pushError(e)));
  });

  const authLink = setContext((_, { headers }) => {
    if (!enableAuthentication) return headers;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const httpLink = createHttpLink({
    uri: graphQLEndpoint,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const retryIf = (error: any, _operation: Operation) => {
    const doNotRetryCodes = [500, 400];
    return !!error && !doNotRetryCodes.includes(error.statusCode);
  };

  const retryLink = new RetryLink({
    delay: {
      initial: 1000,
      max: 60000,
      jitter: true,
    },
    attempts: {
      max: 25,
      retryIf,
    },
  });

  const omitTypename = (key: string, value: unknown) => {
    return key === '__typename' || key === '_id' || /^\$/.test(key) ? undefined : value;
  };

  /*
    Apollo automatically sends _typename in the query.  This causes
    a failure on the server-side because _typename is not specified
    in the schema. This middleware removes it.
  */
  const omitTypenameLink = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
    }
    return forward ? forward(operation) : null;
  });

  return new ApolloClient({
    link: from([authLink, errorLink, retryLink, omitTypenameLink, httpLink]),
    cache: new InMemoryCache({ addTypename: true }),
  });
};

export default useGraphQLClient;
