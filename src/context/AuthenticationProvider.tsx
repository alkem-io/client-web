import React, { FC, useMemo } from 'react';
import { useWhoami } from '../hooks/useWhoami';

export interface AuthContext {
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  isAuthenticated: false,
});

const AuthenticationProvider: FC = ({ children }) => {
  const { data, loading } = useWhoami();
  const isAuthenticated = useMemo(() => !!data?.identity?.traits?.email, [data]);

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
