import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdSubspaceProtectedRoutes from './CrdSubspaceProtectedRoutes';

// ---- Mocks ----

// Capture <Navigate to=...> targets without a real router.
const navigateTargets: string[] = [];
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid="navigate" data-to={to} />;
  },
  Outlet: () => <div data-testid="outlet" />,
  useOutletContext: () => ({}),
}));

vi.mock('@/crd/components/common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading" />,
}));

const useUrlResolverMock = vi.fn();
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => useUrlResolverMock(),
}));

const useSubSpaceMock = vi.fn();
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => useSubSpaceMock(),
}));

const buildSubspace = (url: string, canRead = false) => ({
  subspace: { about: { profile: { url } } },
  permissions: { canRead },
  loading: false,
});

describe('CrdSubspaceProtectedRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateTargets.length = 0;
    useUrlResolverMock.mockReturnValue({ loading: false });
  });

  test('redirects a non-readable subspace to its own About page when profile.url is a full URL', () => {
    // Regression (story #9945): the server returns a fully-qualified URL on
    // profile.url. Passing it raw to <Navigate> made react-router treat it as
    // relative and append the whole `https://…` string to the current path,
    // landing the user on the error page when opening a private L1 of a public
    // L0 from /spaces. The redirect target must be an origin-relative path.
    useSubSpaceMock.mockReturnValue(buildSubspace('https://acc-alkem.io/parent-l0/challenges/private-l1'));

    render(<CrdSubspaceProtectedRoutes />);

    expect(navigateTargets).toEqual(['/parent-l0/challenges/private-l1/about']);
    expect(screen.getByTestId('navigate').getAttribute('data-to')).not.toContain('https://');
  });

  test('redirects correctly when profile.url is already an origin-relative path', () => {
    useSubSpaceMock.mockReturnValue(buildSubspace('/parent-l0/challenges/private-l1'));

    render(<CrdSubspaceProtectedRoutes />);

    expect(navigateTargets).toEqual(['/parent-l0/challenges/private-l1/about']);
  });

  test('shows the loading spinner while the URL is resolving', () => {
    useUrlResolverMock.mockReturnValue({ loading: true });
    useSubSpaceMock.mockReturnValue(buildSubspace('/parent-l0/challenges/private-l1'));

    render(<CrdSubspaceProtectedRoutes />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(navigateTargets).toEqual([]);
  });

  test('renders the protected outlet when the viewer can read', () => {
    useSubSpaceMock.mockReturnValue(buildSubspace('/parent-l0/challenges/private-l1', true));

    render(<CrdSubspaceProtectedRoutes />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(navigateTargets).toEqual([]);
  });
});
