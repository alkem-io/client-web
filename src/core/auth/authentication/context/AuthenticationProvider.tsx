import type { Session } from '@ory/kratos-client';
import React, { type PropsWithChildren } from 'react';
import { useOidcSessionStatus } from '../hooks/useOidcSessionStatus';
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
  const { session, isAuthenticated: kratosAuthenticated, loading: kratosLoading, verified } = useWhoami();
  const { active: oidcActive, loading: oidcLoading } = useOidcSessionStatus();

  // Authenticated only when BOTH the Kratos SSO session AND the BFF's OIDC
  // session agree. Kratos can survive an RP-side logout (multi-RP SSO is
  // intentional) so it cannot be the sole signal. The BFF OIDC session is the
  // authoritative gate for any call hitting /api/private/graphql.
  const isAuthenticated = kratosAuthenticated && oidcActive;
  const loading = kratosLoading || oidcLoading;

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
