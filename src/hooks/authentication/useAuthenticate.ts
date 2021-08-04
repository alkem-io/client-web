import { ApolloClient, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

const resetStore = (client: ApolloClient<object>) => {
  return client.resetStore(); //;.catch(ex => {    throw ex;  });
};

export const useAuthenticate = () => {
  const client = useApolloClient();

  const resetStoreWired = useCallback(() => {
    return resetStore(client);
  }, [client]);

  return {
    resetStore: resetStoreWired,
  };
};
