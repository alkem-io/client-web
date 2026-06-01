import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginRoute from './LoginRoute';

let mockSearch = '';
const mockIsAuthenticated = vi.fn<() => boolean>();

vi.mock('@/core/routing/useQueryParams', () => ({
  useQueryParams: () => new URLSearchParams(mockSearch),
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: mockIsAuthenticated() }),
}));

vi.mock('../pages/LoginPage', () => ({
  default: ({ flow }: { flow?: string }) => <div data-testid="login-page">login-page:{flow ?? 'none'}</div>,
}));

vi.mock('../pages/LoginSuccessPage', () => ({
  default: () => <div data-testid="login-success-page" />,
}));

const renderLoginRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LoginRoute />
    </MemoryRouter>
  );

describe('LoginRoute', () => {
  beforeEach(() => {
    mockSearch = '';
    mockIsAuthenticated.mockReset();
  });

  it('renders the login page for an unauthenticated user with no flow', () => {
    mockIsAuthenticated.mockReturnValue(false);

    renderLoginRoute();

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects an authenticated user away when there is no flow id', () => {
    mockIsAuthenticated.mockReturnValue(true);

    renderLoginRoute();

    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('renders the login page for an authenticated user when a flow id is present (refresh / step-up re-auth)', () => {
    // Kratos redirects refresh logins here as `/login?flow=<id>` while the user
    // still holds a (non-privileged) session — the page must render so the
    // re-authentication can complete and the Settings change can proceed.
    mockSearch = 'flow=refresh-flow-123';
    mockIsAuthenticated.mockReturnValue(true);

    renderLoginRoute();

    expect(screen.getByTestId('login-page')).toHaveTextContent('login-page:refresh-flow-123');
  });
});
