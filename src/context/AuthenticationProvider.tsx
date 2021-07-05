import { Session } from '@ory/kratos-client';
import React, { FC } from 'react';
import { useWhoami } from '../hooks/useWhoami';

export interface AuthContext {
  loading: boolean;
  isAuthenticated: boolean;
  session?: Session;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  isAuthenticated: false,
});

const AuthenticationProvider: FC = ({ children }) => {
  const { session, isAuthenticated, loading } = useWhoami();

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated,
        loading,
        session,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
