import { onError } from '@apollo/client/link/error';
import { createHttpLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { setContext } from '@apollo/client/link/context';
import { useSelector } from 'react-redux';
import { RootState } from '../reducers';

export const useClientConfig = (
  graphQLEndpoint: string,
  enableAuthentication: boolean
): ApolloClient<NormalizedCacheObject> => {
  const token = useSelector<RootState, string | null>(state => state.auth.accessToken);
  console.log('Token: ', token);

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
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
