import { Session } from '@ory/kratos-client';
import React, { FC } from 'react';
import { useWhoami } from '../hooks/useWhoami';

export interface AuthContext {
  loading: boolean;
  isAuthenticated: boolean;
  session?: Session;
  verified: boolean;
  logoutUrl?: string;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  isAuthenticated: false,
  verified: false,
});

const AuthenticationProvider: FC = ({ children }) => {
  const { session, isAuthenticated, loading, verified, logoutUrl } = useWhoami();

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated,
        loading,
        session,
        verified: true || verified, // Remove until smtp server is configured.
        logoutUrl,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationProvider, AuthenticationContext };
