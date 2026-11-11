import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from './CurrentUserProvider';

const auth = vi.hoisted(() => ({
  isAuthenticated: true,
  loading: false,
  verified: true,
  secondFactorRequired: false,
}));
const currentUserLightQuery = vi.hoisted(() => vi.fn());
const platformLevelAuthorizationQuery = vi.hoisted(() => vi.fn());

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => auth,
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCurrentUserLightQuery: currentUserLightQuery,
  usePlatformLevelAuthorizationQuery: platformLevelAuthorizationQuery,
}));
vi.mock('@/main/crdPages/error/CrdTopLevelErrorPage', () => ({
  CrdTopLevelErrorPage: () => <div data-testid="error-page" />,
}));

describe('CurrentUserProvider', () => {
  beforeEach(() => {
    auth.secondFactorRequired = false;
    // A skipped query yields nothing; a query that ran (unskipped) fails here, which would show the error page.
    currentUserLightQuery.mockImplementation(({ skip }: { skip: boolean }) =>
      skip ? { data: undefined, loading: false, error: undefined } : { data: undefined, loading: false, error: new Error('refused') }
    );
    platformLevelAuthorizationQuery.mockReturnValue({ data: undefined, loading: false });
  });

  it('runs no user query and renders no error page while the session is refused for a second factor', () => {
    auth.secondFactorRequired = true;

    render(
      <UserProvider>
        <span data-testid="child" />
      </UserProvider>
    );

    expect(currentUserLightQuery).toHaveBeenCalledWith({ skip: true });
    expect(platformLevelAuthorizationQuery).toHaveBeenCalledWith({ skip: true });
    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('runs the user queries for a served session', () => {
    render(
      <UserProvider>
        <span />
      </UserProvider>
    );

    expect(currentUserLightQuery).toHaveBeenCalledWith({ skip: false });
    expect(platformLevelAuthorizationQuery).toHaveBeenCalledWith({ skip: false });
  });
});
