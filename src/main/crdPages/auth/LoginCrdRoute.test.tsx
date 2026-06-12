import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginCrdRoute } from './LoginCrdRoute';

let mockSearch = '';
const mockIsAuthenticated = vi.fn<() => boolean>();
const replaceSpy = vi.fn<(url: string) => void>();

vi.mock('@/core/routing/useQueryParams', () => ({
  useQueryParams: () => new URLSearchParams(mockSearch),
}));

// The OIDC BFF (/api/auth/oidc/*) is apex-only; the redirect must be prefixed
// with the apex origin returned by this hook (mirrors `LoginPage`).
vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({
  default: () => 'https://sandbox-alkem.io',
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: mockIsAuthenticated() }),
}));

// Render a cheap sentinel for the login screen so we can assert whether it
// mounted without pulling in the full CRD auth UI / Kratos stack.
vi.mock('@/crd/components/auth/LoginCard', () => ({
  LoginCard: ({ descriptor }: { descriptor?: { flowType?: string } }) => (
    <div data-testid="crd-login-card">{descriptor?.flowType ?? 'no-descriptor'}</div>
  ),
}));
vi.mock('./AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/core/auth/authentication/pages/LoginSuccessPage', () => ({ default: () => <div /> }));
vi.mock('@/core/auth/authentication/hooks/useKratosFlow', () => ({
  default: () => ({ flow: undefined, error: undefined, loading: false, refetch: vi.fn() }),
  FlowTypeName: { Login: 'Login' },
}));
vi.mock('@/core/auth/authentication/hooks/usePasskeyScript', () => ({
  default: () => ({ status: 'idle', error: null, isReady: false }),
}));
vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ returnUrl: undefined, setReturnUrl: vi.fn(), clearReturnUrl: vi.fn() }),
}));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useTransactionScope: () => {} }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('./useKratosMessageCopy', () => ({
  useTranslateDescriptor: () => (descriptor: unknown) => descriptor,
  useKratosMessageCopy: () => (messages: unknown) => messages,
}));
vi.mock('./flowDescriptorAdapter', () => ({ flowDescriptorAdapter: () => ({}) }));
vi.mock('./passkeyTrigger', () => ({
  invokePasskeyTrigger: vi.fn(),
  PasskeyTriggerError: class extends Error {},
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LoginCrdRoute />
    </MemoryRouter>
  );

describe('LoginCrdRoute', () => {
  beforeEach(() => {
    mockSearch = '';
    mockIsAuthenticated.mockReset();
    replaceSpy.mockReset();
    // Simulate the page being served on the identity subdomain (where signup
    // lives), so a same-origin-relative redirect would land on the unrouted
    // identity host. `origin` feeds the returnTo same-origin check.
    vi.stubGlobal('location', {
      origin: 'https://identity.sandbox-alkem.io',
      replace: replaceSpy,
      assign: vi.fn(),
      href: '',
      pathname: '/login',
      search: '',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the login page for an unauthenticated user with no flow', () => {
    mockIsAuthenticated.mockReturnValue(false);

    renderRoute();

    expect(screen.getByTestId('crd-login-card')).toBeInTheDocument();
  });

  it('redirects an authenticated user away when there is no flow id', () => {
    mockIsAuthenticated.mockReturnValue(true);

    renderRoute();

    expect(screen.queryByTestId('crd-login-card')).not.toBeInTheDocument();
  });

  it('OIDC entry hands off to the apex BFF absolutely, not the current (identity) subdomain', () => {
    // Repro of the signup → "Sign in" → /login redirect bug. The signup form is
    // served on identity.<domain>, so its sign-in link bakes that origin into
    // returnUrl. On /login (no flow id → OIDC entry) the page must redirect to
    // the apex BFF; a relative replace would hit identity.<domain>/api/auth/oidc/login
    // which Traefik routes to the SPA catch-all (404 / no OIDC flow).
    mockIsAuthenticated.mockReturnValue(false);
    mockSearch = 'returnUrl=https://identity.sandbox-alkem.io/home';

    renderRoute();

    expect(replaceSpy).toHaveBeenCalledWith('https://sandbox-alkem.io/api/auth/oidc/login?returnTo=%2Fhome');
  });

  it('renders the login page for an authenticated user when a flow id is present (refresh / step-up re-auth)', () => {
    // Kratos redirects refresh logins here as `/login?flow=<id>` while the user
    // still holds a (non-privileged) session — the page must render so the
    // re-authentication can complete and the Settings change can proceed.
    mockSearch = 'flow=refresh-flow-123';
    mockIsAuthenticated.mockReturnValue(true);

    renderRoute();

    expect(screen.getByTestId('crd-login-card')).toBeInTheDocument();
  });
});
