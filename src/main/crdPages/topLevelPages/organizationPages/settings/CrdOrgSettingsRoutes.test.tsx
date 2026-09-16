import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// This test is about which route wins for a given URL. The settings shell and the
// tab pages are heavy integration components (Apollo, organization context), so
// each is stubbed: the shell down to an <Outlet />, the tabs down to a marker.
vi.mock('./CrdOrgSettingsPage', () => ({ default: () => <Outlet /> }));
vi.mock('./profile/CrdOrgProfileTab', () => ({ default: () => <div>PROFILE_TAB</div> }));
vi.mock('./account/CrdOrgAccountTab', () => ({ default: () => <div>ACCOUNT_TAB</div> }));
vi.mock('./community/CrdOrgAssociatesTab', () => ({ default: () => <div>ASSOCIATES_TAB</div> }));
vi.mock('./invitations/CrdOrgInvitationsTab', () => ({ default: () => <div>INVITATIONS_TAB</div> }));
vi.mock('./settings/CrdOrgSettingsTab', () => ({ default: () => <div>SETTINGS_TAB</div> }));

import CrdOrgSettingsRoutes from './CrdOrgSettingsRoutes';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/organization/:organizationNameId/settings/*" element={<CrdOrgSettingsRoutes />} />
      </Routes>
    </MemoryRouter>
  );

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
