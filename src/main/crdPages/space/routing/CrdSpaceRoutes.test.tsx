import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let canRead = true;
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ loading: false }) }));
vi.mock('@/domain/space/context/SpaceContext', () => ({
  SpaceContextProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@/domain/space/context/SubspaceContext', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ permissions: { canRead }, loading: false }),
}));
vi.mock('../layout/CrdSpacePageLayout', () => ({ default: () => <Outlet /> }));
vi.mock('../tabs/CrdSpaceTabbedPages', () => ({ default: () => <Where label="tab page" /> }));
vi.mock('../about/CrdSpaceAboutPage', () => ({ default: () => <Where label="about page" /> }));
vi.mock('../CrdSpaceCalloutPage', () => ({ default: () => <Where label="post page" /> }));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage', () => ({
  default: () => <Where label="settings page" />,
}));
vi.mock('@/main/crdPages/subspace/routing/CrdSubspaceRoutes', () => ({ default: () => <Where label="subspace" /> }));

function Where({ label }: { label: string }) {
  const { pathname, search } = useLocation();
  return <p>{`${label} ${pathname}${search}`}</p>;
}

import CrdSpaceRoutes from './CrdSpaceRoutes';

// Mounted as TopLevelRoutes mounts it (legacy 71f8ddcf TopLevelRoutes.tsx:245-256), at ':spaceNameId/*'.
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path=":spaceNameId/*" element={<CrdSpaceRoutes />} />
      </Routes>
    </MemoryRouter>
  );

describe('CrdSpaceRoutes, the legacy route table (021 T005)', () => {
  beforeEach(() => {
    canRead = true;
  });

  it.each([
    ['/root', 'tab page /root'],
    ['/root/about', 'about page /root/about'],
    ['/root/calendar', 'tab page /root/calendar'],
    ['/root/calendar/event', 'tab page /root/calendar/event'],
    ['/root/collaboration/post', 'post page /root/collaboration/post'],
    ['/root/collaboration/post/response', 'post page /root/collaboration/post/response'],
    ['/root/settings/community', 'settings page /root/settings/community'],
    ['/root/challenges/child/opportunities/grandchild', 'subspace /root/challenges/child/opportunities/grandchild'],
  ])('%s mounts its legacy element', async (path, shown) => {
    renderAt(path);
    expect(await screen.findByText(shown)).toBeInTheDocument();
  });

  it.each([
    ['dashboard', 1],
    ['community', 2],
    ['subspaces', 3],
    ['knowledge-base', 4],
    ['custom', 5],
    ['contribute', 1],
    ['explore/anything', 1],
  ])('the legacy section path /%s lands on tab position %i', async (section, position) => {
    renderAt(`/root/${section}`);
    expect(await screen.findByText(`tab page /root/?tab=${position}`)).toBeInTheDocument();
  });

  it('sends a viewer without READ to About, and keeps subspaces reachable outside the parent read gate', async () => {
    canRead = false;
    renderAt('/root');
    expect(await screen.findByText('about page /root/about')).toBeInTheDocument();
    renderAt('/root/challenges/child');
    expect(await screen.findByText('subspace /root/challenges/child')).toBeInTheDocument();
  });
});
