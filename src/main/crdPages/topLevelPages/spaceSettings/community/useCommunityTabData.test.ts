import { renderHook } from '@testing-library/react';
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
  loading: false,
  errored: false,
});

describe('useCommunityTabData — organization invitations (T009)', () => {
  beforeEach(() => {
    vi.mocked(useCommunityAdmin).mockReset();
  });

  it('excludes organization invitations from the generic pendingMemberships table', () => {
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

  it('a non-invited-state organization invitation cannot be revoked', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ state: 'accepting' })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.pendingOrganizationInvitations[0].canRevoke).toBe(false);
  });

  it('onOrgInvitationRevoke delegates to membershipAdmin.onDeleteInvitation', () => {
    const admin = baseAdmin([orgInvitation()]);
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    result.current.onOrgInvitationRevoke('inv-org-1');
    expect(admin.membershipAdmin.onDeleteInvitation).toHaveBeenCalledWith('inv-org-1');
  });

  it('surfaces permissions.canInviteOrganizations from the admin hook', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(baseAdmin([]) as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('rs1'));

    expect(result.current.permissions.canInviteOrganizations).toBe(true);
  });
});
