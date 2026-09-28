import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type {
  CommunityOrg,
  PendingOrganizationInvitation,
  SpaceSettingsCommunityViewProps,
} from './SpaceSettingsCommunityView';
import { SpaceSettingsCommunityView } from './SpaceSettingsCommunityView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' },
  }),
}));

const acme: CommunityOrg = { id: 'org-1', displayName: 'Acme Org', isMember: true, isLead: false };
const beta: CommunityOrg = { id: 'org-2', displayName: 'Beta Org', isMember: true, isLead: false };

const pendingInvitation: PendingOrganizationInvitation = {
  id: 'inv-1',
  organizationDisplayName: 'Gamma Org',
  organizationUrl: '/organization/gamma',
  role: 'memberLead',
  createdDate: '2026-01-01T00:00:00.000Z',
  canRevoke: true,
};

const baseProps: SpaceSettingsCommunityViewProps = {
  level: 'L1',
  members: [],
  pendingMemberships: [],
  organizations: [acme, beta],
  virtualContributors: [],
  pendingOrganizationInvitations: [],
  permissions: {
    canInvite: true,
    canInviteOrganizations: true,
    canAddOrganizations: false,
    canAddVirtualContributors: false,
  },
  onOrgAdd: vi.fn(),
  onInviteOrganizations: vi.fn(),
  onOrgInvitationRevoke: vi.fn(),
  onVCAdd: vi.fn(),
  onVCRemove: vi.fn(),
  onPendingView: vi.fn(),
  onPendingApprove: vi.fn(),
  onPendingReject: vi.fn(),
  onPendingDelete: vi.fn(),
  onInviteUsers: vi.fn(),
};

// The organizations SectionCard is a collapsible section, closed by default —
// every assertion on its contents needs it opened first.
const openOrgSection = async () => {
  await userEvent.click(screen.getByRole('button', { name: /community\.organizations\.title/ }));
};

describe('SpaceSettingsCommunityView — organization search, invite gating, and pending invitations (T010)', () => {
  test('organization search filters the Member Organisations table by name', async () => {
    render(<SpaceSettingsCommunityView {...baseProps} />);
    await openOrgSection();
    expect(screen.getByText('Acme Org')).toBeInTheDocument();
    expect(screen.getByText('Beta Org')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('community.organizations.search'), 'Acme');

    expect(screen.getByText('Acme Org')).toBeInTheDocument();
    expect(screen.queryByText('Beta Org')).not.toBeInTheDocument();
  });

  // The invite action is GATED, never hidden. Its neighbour *Add Organisation* is the one
  // carve-out and is HIDDEN instead (client-web#10292) — see the two tests below — because
  // its privilege is one an ordinary Space admin can never obtain, whereas every Space
  // admin can eventually invite.
  test('Invite organisation button is always rendered, and disabled with a reason when the action is not permitted', async () => {
    const { rerender } = render(
      <SpaceSettingsCommunityView {...baseProps} inviteOrganizationsDisabledReason="no permission" />
    );
    await openOrgSection();
    const gatedButton = screen.getByRole('button', { name: 'community.organizations.invite' });
    expect(gatedButton).toBeInTheDocument();
    expect(gatedButton).toBeDisabled();

    rerender(<SpaceSettingsCommunityView {...baseProps} inviteOrganizationsDisabledReason={undefined} />);
    const enabledButton = screen.getByRole('button', { name: 'community.organizations.invite' });
    expect(enabledButton).toBeInTheDocument();
    expect(enabledButton).toBeEnabled();
  });

  // client-web#10292: hidden, not disabled. `canAddOrganizations` is false both when the
  // privilege is denied AND while the privilege query is still resolving, so this one
  // assertion covers the "render nothing until the answer is known" requirement too.
  test('Add organisation button is not rendered when the direct-add privilege is absent or still unknown', async () => {
    render(
      <SpaceSettingsCommunityView
        {...baseProps}
        permissions={{ ...baseProps.permissions, canAddOrganizations: false }}
      />
    );
    await openOrgSection();

    expect(screen.queryByRole('button', { name: 'community.organizations.add' })).not.toBeInTheDocument();
    // The sibling invite control is unaffected: it stays rendered, gated or not.
    expect(screen.getByRole('button', { name: 'community.organizations.invite' })).toBeInTheDocument();
  });

  test('Add organisation button renders and is enabled for a user who holds the direct-add privilege', async () => {
    render(
      <SpaceSettingsCommunityView
        {...baseProps}
        permissions={{ ...baseProps.permissions, canAddOrganizations: true }}
      />
    );
    await openOrgSection();

    const addButton = screen.getByRole('button', { name: 'community.organizations.add' });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    await userEvent.click(addButton);
    expect(baseProps.onOrgAdd).toHaveBeenCalled();
  });

  test('a gated Invite organisation button does not call onInviteOrganizations when clicked', async () => {
    const onInviteOrganizations = vi.fn();
    render(
      <SpaceSettingsCommunityView
        {...baseProps}
        inviteOrganizationsDisabledReason="no permission"
        onInviteOrganizations={onInviteOrganizations}
      />
    );
    await openOrgSection();
    await userEvent.click(screen.getByRole('button', { name: 'community.organizations.invite' }));
    expect(onInviteOrganizations).not.toHaveBeenCalled();
  });

  test('clicking Invite organisation calls onInviteOrganizations', async () => {
    const onInviteOrganizations = vi.fn();
    render(<SpaceSettingsCommunityView {...baseProps} onInviteOrganizations={onInviteOrganizations} />);
    await openOrgSection();
    await userEvent.click(screen.getByText('community.organizations.invite'));
    expect(onInviteOrganizations).toHaveBeenCalled();
  });

  test('pending organization invitations render with role/date and a Revoke button that calls onOrgInvitationRevoke', async () => {
    const onOrgInvitationRevoke = vi.fn();
    render(
      <SpaceSettingsCommunityView
        {...baseProps}
        pendingOrganizationInvitations={[pendingInvitation]}
        onOrgInvitationRevoke={onOrgInvitationRevoke}
      />
    );
    await openOrgSection();
    expect(screen.getByText('Gamma Org')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /community.organizations.pendingInvitations.revoke/ }));
    expect(onOrgInvitationRevoke).toHaveBeenCalledWith('inv-1');
  });

  test('empty pending invitations renders the empty label, not a Revoke button', async () => {
    render(<SpaceSettingsCommunityView {...baseProps} pendingOrganizationInvitations={[]} />);
    await openOrgSection();
    expect(screen.getByText('community.organizations.pendingInvitations.empty')).toBeInTheDocument();
    expect(screen.queryByText(/pendingInvitations.revoke/)).not.toBeInTheDocument();
  });

  test('a non-revocable pending invitation hides its Revoke button', async () => {
    render(
      <SpaceSettingsCommunityView
        {...baseProps}
        pendingOrganizationInvitations={[{ ...pendingInvitation, canRevoke: false }]}
      />
    );
    await openOrgSection();
    expect(screen.getByText('Gamma Org')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pendingInvitations.revoke/ })).not.toBeInTheDocument();
  });
});
