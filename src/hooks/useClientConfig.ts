import { onError } from '@apollo/client/link/error';
import { createHttpLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { setContext } from '@apollo/client/link/context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../reducers';
import { pushError } from '../reducers/error/actions';

export const useClientConfig = (
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
      const newMessage = `[Network error]: ${networkError}`;
      console.log(newMessage);
      errors.push(new Error(newMessage));
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

  return new ApolloClient({
    link: from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

export default useClientConfig;
