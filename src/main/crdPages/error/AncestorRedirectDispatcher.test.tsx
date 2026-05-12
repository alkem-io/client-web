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

  test('renders CRD dialog when toggle is on, route is CRD, and isNotAuthorized=true', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space/some-private-resource' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} isNotAuthorized={true} />);

    expect(screen.getByTestId('crd-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('mui-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when CRD toggle is off (even with all other flags right)', () => {
    useCrdEnabledMock.mockReturnValue(false);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} isNotAuthorized={true} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when current pathname is NOT a CRD route', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/admin/users' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} isNotAuthorized={true} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when isNotAuthorized is false (e.g. NotFoundError)', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space' });

    // Underlying error page is MUI Error404 (CRD 404 is out of scope), so the
    // dialog must also be MUI to keep the page+dialog visually consistent.
    render(<AncestorRedirectDispatcher closestAncestor={ancestor} isNotAuthorized={false} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });

  test('renders MUI dialog when isNotAuthorized is undefined (defensive default)', () => {
    useCrdEnabledMock.mockReturnValue(true);
    useLocationMock.mockReturnValue({ pathname: '/welcome-space' });

    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('mui-redirect-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-redirect-dialog')).not.toBeInTheDocument();
  });
});
