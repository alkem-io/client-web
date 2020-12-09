import { ApolloClient } from '@apollo/client';
import React, { FC } from 'react';
import { useAuthentication, UseAuthenticationResult } from '../hooks';

export interface AuthContext extends UseAuthenticationResult {
  loading: boolean;
  graphqlClient?: ApolloClient<any>;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  signIn: () => Promise.resolve(undefined),
  signOut: () => Promise.resolve(undefined),
  acquireToken: () => Promise.resolve(undefined),
  getAccounts: () => {
    console.error('Context not initialized');
    return [];
  },
  // resetCache: () => Promise.resolve(null),
  // resetStore: () => Promise.resolve(null),
  graphqlClient: undefined,
});

const AuthenticationProvider: FC<{ client?: ApolloClient<any> }> = ({ children, client }) => {
  const {
    signIn,
    signOut,
    acquireToken,
    getAccounts,
    // resetCache,
    // resetStore,
    loading: authenticationLoading,
  } = useAuthentication();

  const loading = authenticationLoading;

  // if (loading) return <Loading text={'Initializaing authentication ...'} />;

  return (
    <AuthenticationContext.Provider
      value={{
        signIn,
        signOut,
        acquireToken,
        getAccounts,
        // resetCache,
        // resetStore,
        loading,
        graphqlClient: client,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
