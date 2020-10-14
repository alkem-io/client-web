import { onError } from '@apollo/client/link/error';
import { createHttpLink, from, InMemoryCache, NormalizedCacheObject, Operation } from '@apollo/client';
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

    if (graphQLErrors)
      errors = graphQLErrors.map(({ message, locations, path }) => {
        const newMessage = `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`;
        console.log(newMessage);
        return new Error(newMessage);
      });

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

  return new ApolloClient({
    link: from([authLink, errorLink, retryLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

export default useGraphQLClient;
