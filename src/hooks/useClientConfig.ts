import { createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { setContext } from '@apollo/client/link/context';
import { useSelector } from 'react-redux';
import { IRootState } from '../reducers';

export const useClientConfig = (graphQLEndpoint: string): ApolloClient<NormalizedCacheObject> => {
  const token = useSelector<IRootState, string | null>(state => state.auth.accessToken);

  const httpLink = createHttpLink({
    uri: graphQLEndpoint,
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export default useClientConfig;
