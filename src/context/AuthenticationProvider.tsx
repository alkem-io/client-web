import React, { FC, useEffect, useState } from 'react';
import { useAuthentication, UseAuthenticationResult } from '../hooks';
import { AUTHENTICATED_KEY, AUTH_STATUS_KEY, TOKEN_KEY } from '../models/Constants';
import { AuthStatus } from '../reducers/auth/types';

export interface AuthContext extends UseAuthenticationResult {
  loading: boolean;
  isAuthenticated: boolean;
  status: AuthStatus;
  token?: string;
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
  isAuthenticated: false,
  status: 'unauthenticated',
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

  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(AUTHENTICATED_KEY) === 'true');
  const [status, setStatus] = useState(localStorage.getItem(AUTH_STATUS_KEY) as AuthStatus);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) ?? undefined);

  const handleStorageChange = (e: StorageEvent) => {
    console.log('Handling changes: ', e.key);
    switch (e.key) {
      case AUTHENTICATED_KEY:
        setIsAuthenticated(e.newValue === 'true');
        break;
      case AUTH_STATUS_KEY:
        setStatus(oldValue => (e.newValue ? (e.newValue as AuthStatus) : oldValue));
        break;
      case TOKEN_KEY:
        setToken(e.newValue ?? undefined);
    }
  };

  useEffect(() => {
    console.log('Register handler');
    window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log('Un Register handler');
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
        isAuthenticated,
        status,
        token,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
