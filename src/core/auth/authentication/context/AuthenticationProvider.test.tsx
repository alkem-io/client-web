import { render, screen } from '@testing-library/react';
import { use } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationContext, AuthenticationProvider } from './AuthenticationProvider';

const whoami = vi.hoisted(() => ({
  session: undefined as unknown,
  isAuthenticated: false,
  loading: false,
  verified: false,
}));
const oidcStatus = vi.hoisted(() => ({ active: false, loading: false }));
const recoverySpy = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/authentication/hooks/useWhoami', () => ({
  useWhoami: () => whoami,
}));
vi.mock('@/core/auth/authentication/hooks/useOidcSessionStatus', () => ({
  useOidcSessionStatus: () => oidcStatus,
}));
vi.mock('@/core/auth/authentication/hooks/useOidcSessionRecovery', () => ({
  useOidcSessionRecovery: recoverySpy,
}));

const Probe = () => {
  const { isAuthenticated, loading } = use(AuthenticationContext);
  return <span data-testid="probe">{`${isAuthenticated}:${loading}`}</span>;
};

const renderProbe = () =>
  render(
    <AuthenticationProvider>
      <Probe />
    </AuthenticationProvider>
  );

describe('AuthenticationProvider isAuthenticated gate', () => {
  beforeEach(() => {
    whoami.isAuthenticated = false;
    whoami.loading = false;
    oidcStatus.active = false;
    oidcStatus.loading = false;
    recoverySpy.mockClear();
  });

  it('is authenticated when the BFF OIDC session is active even if the Kratos SSO session expired (#9965)', () => {
    // The bug case: header showed "Login" while /api/private/graphql (gated
    // solely by the BFF session) kept authorizing CRUD.
    whoami.isAuthenticated = false;
    oidcStatus.active = true;
    renderProbe();
    expect(screen.getByTestId('probe').textContent).toBe('true:false');
  });

  it('is authenticated when both sessions are alive', () => {
    whoami.isAuthenticated = true;
    oidcStatus.active = true;
    renderProbe();
    expect(screen.getByTestId('probe').textContent).toBe('true:false');
  });

  it('is NOT authenticated on a Kratos-only session (RP-side logout keeps multi-RP SSO alive)', () => {
    whoami.isAuthenticated = true;
    oidcStatus.active = false;
    renderProbe();
    expect(screen.getByTestId('probe').textContent).toBe('false:false');
  });

  it('is NOT authenticated when neither session exists', () => {
    renderProbe();
    expect(screen.getByTestId('probe').textContent).toBe('false:false');
  });

  it('reports loading while either probe is unresolved', () => {
    whoami.loading = true;
    oidcStatus.active = true;
    renderProbe();
    expect(screen.getByTestId('probe').textContent).toBe('true:true');
  });

  it('still drives the post-password-change recovery with the raw Kratos signal', () => {
    whoami.isAuthenticated = true;
    oidcStatus.active = false;
    renderProbe();
    expect(recoverySpy).toHaveBeenCalledWith({
      loading: false,
      kratosAuthenticated: true,
      oidcActive: false,
    });
  });
});
