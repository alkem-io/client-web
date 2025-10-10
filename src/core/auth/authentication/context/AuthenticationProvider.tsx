import { Session } from '@ory/kratos-client';
import React, { PropsWithChildren } from 'react';
import { useWhoami } from '../hooks/useWhoami';

export interface AuthContext {
  loading: boolean;
  isAuthenticated: boolean;
  session?: Session;
  verified: boolean;
}

const AuthenticationContext = React.createContext<AuthContext>({
  loading: true,
  isAuthenticated: false,
  verified: false,
});

const AuthenticationProvider = ({ children }: PropsWithChildren) => {
  const { session, isAuthenticated, loading, verified } = useWhoami();

  return (
    <AuthenticationContext
      value={{
        isAuthenticated,
        loading,
        session,
        verified: true || verified, // Remove until smtp server is configured.
      }}
    >
      {children}
    </AuthenticationContext>
  );
};

export { AuthenticationContext, AuthenticationProvider };
