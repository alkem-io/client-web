import { ApolloClient, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { useAuthenticationContext } from './useAuthenticationContext';

const resetStore = (client: ApolloClient<object>) => {
  return client.resetStore(); //;.catch(ex => {    throw ex;  });
};

export const useAuthenticate = () => {
  const client = useApolloClient();
  const { status } = useAuthenticationContext();

  const resetStoreWired = useCallback(() => {
    return resetStore(client);
  }, [client]);

  return {
    status,
    resetStore: resetStoreWired,
  };
};
