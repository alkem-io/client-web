import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdSubspaceRoutes from './CrdSubspaceRoutes';

const layoutMounts = vi.fn();
let canRead = true;

vi.mock('../layout/CrdSubspacePageLayout', () => ({
  default: () => {
    layoutMounts(useLocation().pathname);
    return (
      <main data-testid="subspace-layout">
        <Outlet />
      </main>
    );
  },
}));
vi.mock('../tabs/CrdSubspaceCalloutsPage', () => ({ default: () => <p>phase page</p> }));
vi.mock('../about/CrdSubspaceAboutPage', () => ({ default: () => <p>about page</p> }));
vi.mock('../CrdSubspaceCalloutPage', () => ({ default: () => <p>post page</p> }));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage', () => ({
  default: () => <p>settings page</p>,
}));
vi.mock('@/domain/spaceAdmin/routing/NonSpaceAdminRedirect', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/main/crdPages/error/CrdNotFoundBranch', () => ({ CrdNotFoundBranch: () => <p>not found</p> }));
vi.mock('@/crd/components/common/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ loading: false }) }));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: { id: 'deep', about: { profile: { url: `http://localhost${pathOf(2)}` } } },
    permissions: { canRead },
    loading: false,
  }),
}));

// The legacy L1/L2 table serves every depth the seeded ('space','space') max_depth 2 allows.
const pathOf = (depth: number) =>
  `/root/challenges/l1${Array.from({ length: depth - 1 }, (_, index) => `/opportunities/l${index + 2}`).join('')}`;

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/root/challenges/:subspaceNameId/*" element={<CrdSubspaceRoutes />} />
      </Routes>
    </MemoryRouter>
  );

describe('CrdSubspaceRoutes (021 T018, depths 1-2)', () => {
  beforeEach(() => {
    canRead = true;
    layoutMounts.mockClear();
  });

  test.each([1, 2])('depth %i mounts the subspace page layout with its phase page', async depth => {
    renderAt(pathOf(depth));
    expect(await screen.findByText('phase page')).toBeInTheDocument();
    expect(screen.getByTestId('subspace-layout')).toBeInTheDocument();
    expect(layoutMounts).toHaveBeenCalledWith(pathOf(depth));
  });

  test.each([
    [1, 'about', 'about page'],
    [2, 'about', 'about page'],
    [2, 'settings/community', 'settings page'],
    [2, 'calendar', 'phase page'],
    [2, 'collaboration/post-1', 'post page'],
    // QA E5: a nested space's post, response and event URLs (the server's url rules: collaboration/, posts/, calendar/).
    [1, 'collaboration/post-1', 'post page'],
    [1, 'collaboration/post-1/posts/response-1', 'post page'],
    [2, 'collaboration/post-1/posts/response-1', 'post page'],
    [2, 'calendar/event-1', 'phase page'],
  ])('depth %i keeps the %s child route', async (depth, suffix, text) => {
    renderAt(`${pathOf(depth)}/${suffix}`);
    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(screen.getByTestId('subspace-layout')).toBeInTheDocument();
  });

  test('an unknown suffix stays not found at depth', async () => {
    renderAt(`${pathOf(2)}/unknown-section`);
    expect(await screen.findByText('not found')).toBeInTheDocument();
  });

  test('a non-reader is redirected to that space own About at depth', async () => {
    canRead = false;
    renderAt(pathOf(2));
    expect(await screen.findByText('about page')).toBeInTheDocument();
    expect(layoutMounts).toHaveBeenLastCalledWith(`${pathOf(2)}/about`);
  });
});
