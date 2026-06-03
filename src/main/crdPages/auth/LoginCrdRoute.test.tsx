import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginCrdRoute } from './LoginCrdRoute';

let mockSearch = '';
const mockIsAuthenticated = vi.fn<() => boolean>();

vi.mock('@/core/routing/useQueryParams', () => ({
  useQueryParams: () => new URLSearchParams(mockSearch),
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
