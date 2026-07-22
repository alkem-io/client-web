import type { Session } from '@ory/kratos-client';
import React, { type PropsWithChildren } from 'react';
import { useOidcSessionRecovery } from '@/core/auth/authentication/hooks/useOidcSessionRecovery';
import { useOidcSessionStatus } from '@/core/auth/authentication/hooks/useOidcSessionStatus';
import { useWhoami } from '@/core/auth/authentication/hooks/useWhoami';

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

  // The BFF OIDC session is the authoritative gate for any call hitting
  // /api/private/graphql, so it is also the sole signal for "logged in": a
  // Kratos SSO session that expired or was revoked while the BFF session is
  // still alive must NOT flip the UI to logged-out — the user still has full
  // API access, and showing the Login button next to working CRUD controls is
  // a lie (see client-web#9965). The reverse (Kratos alive after an RP-side
  // logout — multi-RP SSO is intentional) is equally covered: oidcActive is
  // false, so Kratos alone never reads as logged in.
  const isAuthenticated = oidcActive;
  const loading = kratosLoading || oidcLoading;

  // After a password change Kratos refreshes its SSO session but the BFF OIDC
  // session is left stale, so the user looks logged out until they click "Log
  // in" (which silently re-auths via Hydra). Do that handoff automatically.
  useOidcSessionRecovery({ loading, kratosAuthenticated, oidcActive });

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
