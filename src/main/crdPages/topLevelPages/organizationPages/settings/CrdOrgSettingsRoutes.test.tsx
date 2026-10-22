import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrgSettingsAccessMode } from '../useCanEditOrganizationSettings';

// This test is about which route wins for a given URL. The settings shell and the
// tab pages are heavy integration components (Apollo, organization context), so
// each is stubbed: the shell down to an <Outlet />, the tabs down to a marker.
vi.mock('./CrdOrgSettingsPage', () => ({ default: () => <Outlet /> }));
vi.mock('./profile/CrdOrgProfileTab', () => ({ default: () => <div>PROFILE_TAB</div> }));
vi.mock('./account/CrdOrgAccountTab', () => ({ default: () => <div>ACCOUNT_TAB</div> }));
vi.mock('./community/CrdOrgAssociatesTab', () => ({ default: () => <div>ASSOCIATES_TAB</div> }));
vi.mock('./membership/CrdOrgMembershipTab', () => ({ default: () => <div>MEMBERSHIP_TAB</div> }));
vi.mock('./invitations/CrdOrgInvitationsTab', () => ({ default: () => <div>INVITATIONS_TAB</div> }));
vi.mock('./settings/CrdOrgSettingsTab', () => ({ default: () => <div>SETTINGS_TAB</div> }));

let accessMode: OrgSettingsAccessMode = 'full';
let loading = false;
vi.mock('../useCanEditOrganizationSettings', () => ({
  default: () => ({ accessMode, loading, canEditSettings: accessMode !== 'none', hasUpdatePrivilege: false }),
}));

import CrdOrgSettingsRoutes from './CrdOrgSettingsRoutes';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/organization/:organizationNameId/settings/*" element={<CrdOrgSettingsRoutes />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  accessMode = 'full';
  loading = false;
});

describe('CrdOrgSettingsRoutes — the retired Authorization tab', () => {
  it('redirects /settings/authorization to the Associates tab', async () => {
    renderAt('/organization/acme/settings/authorization');
    expect(await screen.findByText('ASSOCIATES_TAB')).toBeInTheDocument();
  });

  it('does not render the Invitations tab for that segment', async () => {
    // Two sibling routes once declared path="authorization"; react-router matches
    // the earlier sibling, so the redirect was dead and this URL served the
    // Invitations tab instead. Only one route may own the segment.
    renderAt('/organization/acme/settings/authorization');
    await screen.findByText('ASSOCIATES_TAB');
    expect(screen.queryByText('INVITATIONS_TAB')).not.toBeInTheDocument();
  });

  it('leaves /settings/invitations on the Invitations tab', async () => {
    renderAt('/organization/acme/settings/invitations');
    expect(await screen.findByText('INVITATIONS_TAB')).toBeInTheDocument();
  });

  it('leaves /settings/community on the Associates tab', async () => {
    renderAt('/organization/acme/settings/community');
    expect(await screen.findByText('ASSOCIATES_TAB')).toBeInTheDocument();
  });
});

describe('CrdOrgSettingsRoutes — the Membership tab', () => {
  it('leaves /settings/membership on the Membership tab', async () => {
    renderAt('/organization/acme/settings/membership');
    expect(await screen.findByText('MEMBERSHIP_TAB')).toBeInTheDocument();
  });

  it('still redirects /settings/authorization to the Associates tab, not to Membership', async () => {
    renderAt('/organization/acme/settings/authorization');
    expect(await screen.findByText('ASSOCIATES_TAB')).toBeInTheDocument();
    expect(screen.queryByText('MEMBERSHIP_TAB')).not.toBeInTheDocument();
  });
});

const TAB_MARKERS = [
  'PROFILE_TAB',
  'ACCOUNT_TAB',
  'ASSOCIATES_TAB',
  'MEMBERSHIP_TAB',
  'INVITATIONS_TAB',
  'SETTINGS_TAB',
] as const;

const expectOnlyTab = async (marker: (typeof TAB_MARKERS)[number]) => {
  expect(await screen.findByText(marker)).toBeInTheDocument();
  for (const other of TAB_MARKERS.filter(m => m !== marker)) {
    expect(screen.queryByText(other)).not.toBeInTheDocument();
  }
};

describe('CrdOrgSettingsRoutes — full access is unchanged', () => {
  it.each([
    ['', 'PROFILE_TAB'],
    ['/profile', 'PROFILE_TAB'],
    ['/account', 'ACCOUNT_TAB'],
    ['/community', 'ASSOCIATES_TAB'],
    ['/membership', 'MEMBERSHIP_TAB'],
    ['/invitations', 'INVITATIONS_TAB'],
    ['/settings', 'SETTINGS_TAB'],
    ['/authorization', 'ASSOCIATES_TAB'],
    ['/no-such-tab', 'PROFILE_TAB'],
    ['/no/such/tab', 'PROFILE_TAB'],
  ] as const)('/settings%s → %s', async (suffix, marker) => {
    renderAt(`/organization/acme/settings${suffix}`);
    await expectOnlyTab(marker);
  });
});

describe('CrdOrgSettingsRoutes — a community-only viewer reaches the Community tab alone', () => {
  beforeEach(() => {
    accessMode = 'community-only';
  });

  it.each([
    [''],
    ['/profile'],
    ['/account'],
    ['/community'],
    ['/membership'],
    ['/invitations'],
    ['/settings'],
    ['/authorization'],
    ['/no-such-tab'],
    ['/no/such/tab'],
  ] as const)('/settings%s → the Community tab', async suffix => {
    renderAt(`/organization/acme/settings${suffix}`);
    await expectOnlyTab('ASSOCIATES_TAB');
  });

  it('mounts no tab while the privileges are still loading', () => {
    loading = true;
    renderAt('/organization/acme/settings/profile');
    for (const marker of TAB_MARKERS) {
      expect(screen.queryByText(marker)).not.toBeInTheDocument();
    }
  });
});
