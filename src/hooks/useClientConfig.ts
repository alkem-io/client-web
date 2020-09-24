import { createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
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
    link: enableAuthentication ? authLink.concat(httpLink) : httpLink,
    cache: new InMemoryCache(),
  });
};

export default useClientConfig;
