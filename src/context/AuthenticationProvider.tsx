import React, { FC, useEffect } from 'react';
import { TOKEN_STORAGE_KEY, useAuthentication, UseAuthenticationResult } from '../hooks';

export interface AuthContext extends UseAuthenticationResult {
  loading: boolean;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  signIn: () => Promise.resolve(undefined),
  signOut: () => Promise.resolve(undefined),
  acquireToken: () => Promise.resolve(undefined),
  getAccounts: () => [],
  resetCache: () => Promise.resolve(null),
});

const AuthenticationProvider: FC<{}> = ({ children }) => {
  useEffect(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const {
    signIn,
    signOut,
    acquireToken,
    getAccounts,
    resetCache,
    loading: authenticationLoading,
  } = useAuthentication();

  const loading = authenticationLoading;

  return (
    <AuthenticationContext.Provider
      value={{
        signIn,
        signOut,
        acquireToken,
        getAccounts,
        resetCache,
        loading,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
