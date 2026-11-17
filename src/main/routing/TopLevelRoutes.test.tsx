import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TopLevelRoutes } from './TopLevelRoutes';

const auth = vi.hoisted(() => ({ secondFactorRequired: false }));
const routeToSecondFactor = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => auth,
}));
vi.mock('@/core/auth/authentication/routeToSecondFactor', () => ({ routeToSecondFactor }));
vi.mock('@/core/auth/authentication/routing/useRedirectToIdentityDomain', () => ({ default: () => {} }));
vi.mock('@/core/auth/authentication/hooks/useSignUpReturnRedirect', () => ({ useSignUpReturnRedirect: () => {} }));
vi.mock('@/core/auth/authentication/routing/IdentityRoute', async () => {
  const { Route } = await import('react-router-dom');
  return { IdentityRoute: () => <Route path="login" element={<div data-testid="login" />} /> };
});
vi.mock('../ui/layout/topLevelWrappers/App', async () => {
  const { Outlet } = await import('react-router-dom');
  return { default: () => <Outlet /> };
});
vi.mock('../ui/layout/CrdLayoutWrapper', () => ({ CrdLayoutWrapper: () => <div data-testid="layout" /> }));
vi.mock('@/domain/platform/routes/RedirectToLanding', () => ({ default: () => <div data-testid="landing" /> }));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TopLevelRoutes />
    </MemoryRouter>
  );

describe('TopLevelRoutes — session refused for a second factor', () => {
  beforeEach(() => {
    auth.secondFactorRequired = false;
    routeToSecondFactor.mockClear();
  });

  it('calls the helper once and renders nothing outside the auth routes', () => {
    auth.secondFactorRequired = true;

    const { container } = renderAt('/');

    expect(routeToSecondFactor).toHaveBeenCalledTimes(1);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the auth routes without routing away', () => {
    auth.secondFactorRequired = true;

    renderAt('/login');

    expect(routeToSecondFactor).not.toHaveBeenCalled();
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('renders the routes for a served session', () => {
    renderAt('/');

    expect(routeToSecondFactor).not.toHaveBeenCalled();
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });
});
