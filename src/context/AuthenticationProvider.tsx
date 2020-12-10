import React, { FC } from 'react';
import { useAuthentication, UseAuthenticationResult } from '../hooks';

export interface AuthContext extends UseAuthenticationResult {
  loading: boolean;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  signIn: () => Promise.resolve(undefined),
  signOut: () => Promise.resolve(undefined),
  acquireToken: () => Promise.resolve(undefined),
  refreshToken: () => Promise.resolve(undefined),
  getAccounts: () => {
    console.error('Context not initialized');
    return [];
  },
});

const AuthenticationProvider: FC = ({ children }) => {
  const {
    signIn,
    signOut,
    acquireToken,
    refreshToken,
    getAccounts,
    loading: authenticationLoading,
  } = useAuthentication();

  const loading = authenticationLoading;

  return (
    <AuthenticationContext.Provider
      value={{
        signIn,
        signOut,
        acquireToken,
        refreshToken,
        getAccounts,
        loading,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
