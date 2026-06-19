import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { UrlType } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

const useLocationMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useLocation: () => useLocationMock(),
}));

const useCrdEnabledMock = vi.fn();
vi.mock('@/main/crdPages/useCrdEnabled', () => ({
  useCrdEnabled: () => useCrdEnabledMock(),
}));

vi.mock('@/main/crdPages/error/isCrdRoute', () => ({
  isCrdRoute: (pathname: string) => {
    if (!pathname) return false;
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return false;
    return pathname.startsWith('/welcome-space') || pathname === '/home' || pathname === '/restricted';
  },
}));

vi.mock('@/main/crdPages/error/CrdRedirectToAncestorDialog', () => ({
  CrdRedirectToAncestorDialog: () => <div data-testid="crd-redirect-dialog">CRD dialog</div>,
}));

vi.mock('@/core/40XErrorHandler/RedirectToAncestorDialog', () => ({
  RedirectToAncestorDialog: () => <div data-testid="mui-redirect-dialog">MUI dialog</div>,
}));

import { AncestorRedirectDispatcher } from './AncestorRedirectDispatcher';

const ancestor: ClosestAncestor = {
  url: '/welcome-space',
  type: UrlType.Space,
  space: { id: 'space-1' },
};

describe('AncestorRedirectDispatcher', () => {
  beforeEach(() => {
    useLocationMock.mockReset();
    useCrdEnabledMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders CRD dialog when toggle is on and route is CRD (NotAuthorized / 403)', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space/some-private-resource' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('crd-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('mui-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders CRD dialog on a CRD route for NotFound + closestAncestor (private subspace redirect)', () => {
    // A private subspace resolves to NotFoundError({ closestAncestor }); the page
    // beneath is now the CRD 404 page, so the redirect dialog must also be CRD —
    // never the MUI dialog on top of a CRD page.
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('crd-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('mui-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when CRD toggle is off', () => {
    useCrdEnabledMock.mockReturnValue(false);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when current pathname is NOT a CRD route', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/admin/users' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });
});
