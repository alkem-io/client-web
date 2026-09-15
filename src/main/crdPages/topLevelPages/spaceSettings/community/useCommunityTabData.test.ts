import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import type { InvitationModel } from '@/domain/access/model/InvitationModel';

vi.mock('@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin', () => ({
  default: vi.fn(),
}));

import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import { useCommunityTabData } from './useCommunityTabData';

const orgInvitation = (overrides: Partial<InvitationModel> = {}): InvitationModel => ({
  id: 'inv-org-1',
  createdDate: new Date('2026-01-01T00:00:00.000Z'),
  updatedDate: new Date('2026-01-01T00:00:00.000Z'),
  state: 'invited',
  nextEvents: ['ACCEPT', 'REJECT'],
  contributorType: ActorType.Organization,
  extraRoles: [],
  actor: { id: 'org-1', profile: { id: 'p1', displayName: 'Acme Org', url: '/organization/acme' } },
  ...overrides,
});

const userInvitation = (): InvitationModel => ({
  id: 'inv-user-1',
  createdDate: new Date('2026-01-01T00:00:00.000Z'),
  updatedDate: new Date('2026-01-01T00:00:00.000Z'),
  state: 'invited',
  nextEvents: ['ACCEPT', 'REJECT'],
  contributorType: ActorType.User,
  extraRoles: [],
  actor: { id: 'user-1', profile: { id: 'p2', displayName: 'Alice', url: '/user/alice' } },
});

const baseAdmin = (invitations: InvitationModel[]) => ({
  userAdmin: {
    members: [],
    onLeadChange: vi.fn(),
    onAuthorizationChange: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    getAvailable: vi.fn(async () => []),
    inviteContributors: vi.fn(),
  },
  organizationAdmin: {
    members: [],
    onLeadChange: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    getAvailable: vi.fn(async () => []),
    inviteContributors: vi.fn(),
  },
  virtualContributorAdmin: { members: [], onAdd: vi.fn(), onRemove: vi.fn(), inviteContributors: vi.fn() },
  membershipAdmin: {
    memberRoleDefinition: undefined,
    leadRoleDefinition: undefined,
    applications: [],
    invitations,
    platformInvitations: [],
    onApplicationStateChange: vi.fn(),
    onInvitationStateChange: vi.fn(),
    onDeleteInvitation: vi.fn(),
    onDeletePlatformInvitation: vi.fn(),
  },
  permissions: {
    canAddUsers: true,
    canInvite: true,
    canInviteOrganizations: true,
    canAddOrganizations: false,
    canAddVirtualContributors: false,
    canAddVirtualContributorsFromAccount: false,
  },
  myPrivileges: [],
  loading: false,
  errored: false,
});

describe('useCommunityTabData — organization invitations (T009)', () => {
  beforeEach(() => {
    vi.mocked(useCommunityAdmin).mockReset();
  });

  it('excludes OPEN organization invitations from the generic pendingMemberships table', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation(), userInvitation()]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.pendingMemberships).toHaveLength(1);
    expect(result.current.pendingMemberships[0].contributorType).toBe('user');
  });

  it('maps organization invitations into pendingOrganizationInvitations with role Member', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(baseAdmin([orgInvitation()]) as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.pendingOrganizationInvitations).toEqual([
      {
        id: 'inv-org-1',
        organizationDisplayName: 'Acme Org',
        organizationUrl: '/organization/acme',
        role: 'member',
        createdDate: '2026-01-01T00:00:00.000Z',
        canRevoke: true,
      },
    ]);
  });

  it('maps an invitation whose extraRoles includes Lead to role memberLead', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ extraRoles: [RoleName.Lead] })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.pendingOrganizationInvitations[0].role).toBe('memberLead');
  });

  it('an accepting-state organization invitation is listed but cannot be revoked', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ state: 'accepting' })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.pendingOrganizationInvitations).toHaveLength(1);
    expect(result.current.pendingOrganizationInvitations[0].canRevoke).toBe(false);
  });

  it.each([
    'accepted',
    'rejected',
  ] as const)('moves a %s organization invitation out of pendingOrganizationInvitations and into the generic table, deletable', state => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ state })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    // No longer presented as outstanding ...
    expect(result.current.pendingOrganizationInvitations).toHaveLength(0);
    // ... but the row still exists server-side, so it must remain visible and
    // removable exactly like the equivalent user invitation — otherwise a
    // declined organization invitation is invisible AND undeletable forever.
    expect(result.current.pendingMemberships).toEqual([
      expect.objectContaining({
        id: 'inv-org-1',
        type: 'invitation',
        state,
        contributorType: 'organization',
        canDelete: true,
      }),
    ]);
  });

  it('onOrgInvitationRevoke asks for confirmation and only then deletes (CRD rule 9)', async () => {
    const admin = baseAdmin([orgInvitation()]);
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    act(() => result.current.onOrgInvitationRevoke('inv-org-1'));

    // Revoking is destructive — the organization's admins were already emailed —
    // so it must stage a confirmation rather than fire the mutation.
    expect(admin.membershipAdmin.onDeleteInvitation).not.toHaveBeenCalled();
    expect(result.current.pendingRemoval).toEqual(
      expect.objectContaining({ kind: 'organizationInvitationRevoke', id: 'inv-org-1' })
    );

    await act(() => result.current.confirmRemoval());
    expect(admin.membershipAdmin.onDeleteInvitation).toHaveBeenCalledWith('inv-org-1');
    expect(result.current.pendingRemoval).toBeNull();
  });

  it('surfaces permissions.canInviteOrganizations from the admin hook', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(baseAdmin([]) as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.permissions.canInviteOrganizations).toBe(true);
  });
});
