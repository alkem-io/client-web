import { ApolloError } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import type { InvitationModel } from '@/domain/access/model/InvitationModel';

const notify = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: undefined }),
}));

vi.mock('@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin', () => ({
  default: vi.fn(),
}));

import useCommunityAdmin, {
  type CommunityActorMember,
} from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import { useCommunityTabData } from './useCommunityTabData';

const orgInvitation = (overrides: Partial<InvitationModel> = {}): InvitationModel => ({
  id: 'inv-org-1',
  createdDate: new Date('2026-01-01T00:00:00.000Z'),
  updatedDate: new Date('2026-01-01T00:00:00.000Z'),
  state: 'invited',
  // The admin's viewer-specific events on an open invitation (invited –REJECT→, –CANCEL→).
  nextEvents: ['REJECT', 'CANCEL'],
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
  // The admin's viewer-specific events on an open invitation (invited –REJECT→, –CANCEL→).
  nextEvents: ['REJECT', 'CANCEL'],
  contributorType: ActorType.User,
  extraRoles: [],
  actor: { id: 'user-1', profile: { id: 'p2', displayName: 'Alice', url: '/user/alice' } },
});

const member = (id: string, actorType: string, roles: string[]): CommunityActorMember => ({
  id,
  actorType,
  displayName: `Name ${id}`,
  avatarUrl: `/avatar/${id}`,
  url: `/${actorType}/${id}`,
  firstName: actorType === 'user' ? `First ${id}` : undefined,
  email: actorType === 'user' ? `${id}@example.org` : undefined,
  roles,
  isMember: roles.includes('member'),
  isLead: roles.includes('lead'),
  isAdmin: roles.includes('admin'),
});

const baseAdmin = (invitations: InvitationModel[], members: CommunityActorMember[] = []) => ({
  userAdmin: {
    members: members.filter(m => m.actorType === 'user'),
    onLeadChange: vi.fn(),
    onAuthorizationChange: vi.fn(),
    onRemove: vi.fn(),
  },
  organizationAdmin: {
    members: members.filter(m => m.actorType === 'organization'),
    onLeadChange: vi.fn(),
    onRemove: vi.fn(),
  },
  virtualContributorAdmin: {
    members: members.filter(m => m.actorType === 'virtual_contributor'),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  },
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
    onResendPlatformInvitation: vi.fn(),
  },
  permissions: {
    canInvite: true,
    canInviteOrganizations: true,
    canAddVirtualContributors: false,
  },
  gates: {
    invite: true,
    manageMembers: true,
    loading: false,
    virtualContributorPicker: false,
    virtualContributorPickerLoading: false,
  },
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
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(result.current.pendingMemberships).toHaveLength(1);
    expect(result.current.pendingMemberships[0].contributorType).toBe('user');
  });

  it('maps organization invitations into pendingOrganizationInvitations with role Member', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(baseAdmin([orgInvitation()]) as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

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
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(result.current.pendingOrganizationInvitations[0].role).toBe('memberLead');
  });

  it('an accepting-state organization invitation is listed but cannot be revoked', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ state: 'accepting' })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(result.current.pendingOrganizationInvitations).toHaveLength(1);
    expect(result.current.pendingOrganizationInvitations[0].canRevoke).toBe(false);
  });

  it.each([
    ['accepted', false, []],
    ['rejected', true, ['ARCHIVE']],
  ] as const)('moves a %s organization invitation out of pendingOrganizationInvitations and into the generic table (deletable: %s)', (state, canDelete, nextEvents) => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ state, nextEvents: [...nextEvents] })]) as ReturnType<typeof useCommunityAdmin>
    );
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    // No longer presented as outstanding ...
    expect(result.current.pendingOrganizationInvitations).toHaveLength(0);
    // ... but the row still exists server-side, so it must remain visible —
    // otherwise a declined organization invitation is invisible AND undeletable
    // forever. An accepted one cannot be deleted (the server rejects it).
    expect(result.current.pendingMemberships).toEqual([
      expect.objectContaining({
        id: 'inv-org-1',
        type: 'invitation',
        state,
        contributorType: 'organization',
        canDelete,
      }),
    ]);
  });

  it('onOrgInvitationRevoke asks for confirmation and only then deletes (CRD rule 9)', async () => {
    const admin = baseAdmin([orgInvitation()]);
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

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
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(result.current.permissions.canInviteOrganizations).toBe(true);
  });
});

describe('useCommunityTabData — email invitation resend', () => {
  beforeEach(() => {
    vi.mocked(useCommunityAdmin).mockReset();
    notify.mockReset();
  });

  const adminWithPlatformInvitation = () => {
    const admin = baseAdmin([userInvitation()]);
    admin.membershipAdmin.platformInvitations = [
      {
        id: 'pi-1',
        email: 'new@example.com',
        createdDate: new Date('2026-01-01T00:00:00.000Z'),
        roleSetExtraRoles: [],
      },
    ] as never[];
    return admin;
  };

  it('only email invitation rows can be resent', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(adminWithPlatformInvitation() as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(result.current.pendingMemberships.find(m => m.id === 'pi-1')?.canResend).toBe(true);
    expect(result.current.pendingMemberships.find(m => m.id === 'inv-user-1')?.canResend).toBe(false);
  });

  it('resend calls the admin hook and toasts success', async () => {
    const admin = adminWithPlatformInvitation();
    admin.membershipAdmin.onResendPlatformInvitation.mockResolvedValue(undefined);
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    await act(async () => {
      result.current.onPendingResend('pi-1');
    });

    expect(admin.membershipAdmin.onResendPlatformInvitation).toHaveBeenCalledWith('pi-1');
    await waitFor(() => expect(notify).toHaveBeenCalledWith('community.pendingMemberships.resendSuccess', 'success'));
  });

  it('resend maps the throttled error code to the throttled toast', async () => {
    const admin = adminWithPlatformInvitation();
    admin.membershipAdmin.onResendPlatformInvitation.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [{ message: 'slow down', extensions: { code: 'ROLESET_INVITATION_RESEND_THROTTLED' } } as never],
      })
    );
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    await act(async () => {
      result.current.onPendingResend('pi-1');
    });

    await waitFor(() => expect(notify).toHaveBeenCalledWith('community.pendingMemberships.resendThrottled', 'error'));
  });
});

describe('useCommunityTabData — native roster and removal', () => {
  beforeEach(() => {
    vi.mocked(useCommunityAdmin).mockReset();
  });

  const roster = [
    member('u-admin', 'user', ['member', 'lead', 'admin']),
    member('o-lead', 'organization', ['member', 'lead']),
    member('vc-1', 'virtual_contributor', ['member']),
  ];

  it('builds the member rows from the native roster, with the READ_USER_PII email', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(baseAdmin([], roster) as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    expect(vi.mocked(useCommunityAdmin)).toHaveBeenCalledWith({ spaceId: 'space-1', roleSetId: 'rs1' });
    expect(result.current.members).toEqual([
      {
        id: 'u-admin',
        displayName: 'Name u-admin',
        email: 'u-admin@example.org',
        avatarUrl: '/avatar/u-admin',
        url: '/user/u-admin',
        roleLabel: 'Admin, Lead',
        isLead: true,
        isAdmin: true,
        joinedDate: '',
      },
    ]);
    expect(result.current.organizations).toEqual([
      {
        id: 'o-lead',
        displayName: 'Name o-lead',
        avatarUrl: '/avatar/o-lead',
        url: '/organization/o-lead',
        isMember: true,
        isLead: true,
      },
    ]);
    expect(result.current.virtualContributors).toEqual([
      { id: 'vc-1', displayName: 'Name vc-1', url: '/virtual_contributor/vc-1' },
    ]);
    expect(result.current.getMemberFirstName('u-admin')).toBe('First u-admin');
    expect(result.current.gates).toEqual(baseAdmin([]).gates);
  });

  it.each([
    ['user', 'u-admin', (admin: ReturnType<typeof baseAdmin>) => admin.userAdmin.onRemove],
    ['organization', 'o-lead', (admin: ReturnType<typeof baseAdmin>) => admin.organizationAdmin.onRemove],
    ['virtualContributor', 'vc-1', (admin: ReturnType<typeof baseAdmin>) => admin.virtualContributorAdmin.onRemove],
  ] as const)('removing a %s is ONE setRoles with the empty set — no client cascade', async (kind, id, remove) => {
    const admin = baseAdmin([], roster);
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'rs1'));

    act(() => {
      if (kind === 'user') result.current.onUserRemove(id);
      else if (kind === 'organization') result.current.onOrgRemove(id);
      else result.current.onVCRemove(id);
    });
    await act(() => result.current.confirmRemoval());

    expect(remove(admin)).toHaveBeenCalledTimes(1);
    expect(remove(admin)).toHaveBeenCalledWith(id);
    expect(admin.userAdmin.onLeadChange).not.toHaveBeenCalled();
    expect(admin.userAdmin.onAuthorizationChange).not.toHaveBeenCalled();
    expect(admin.organizationAdmin.onLeadChange).not.toHaveBeenCalled();
  });
});

describe('useCommunityTabData — request actions follow MembershipRequest.availableEvents', () => {
  beforeEach(() => {
    vi.mocked(useCommunityAdmin).mockReset();
  });

  const application = (nextEvents: string[], state = 'new') => ({
    id: 'app-1',
    createdDate: new Date('2026-01-01T00:00:00.000Z'),
    updatedDate: new Date('2026-01-01T00:00:00.000Z'),
    state,
    nextEvents,
    contributorType: ActorType.User,
    actor: { id: 'user-2', profile: { displayName: 'Bob', url: '/user/bob' } },
  });

  it('offers approve / reject / delete only for the events the viewer may send', () => {
    const admin = baseAdmin([]);
    admin.membershipAdmin.applications = [application(['REJECT'])] as never[];
    vi.mocked(useCommunityAdmin).mockReturnValue(admin as ReturnType<typeof useCommunityAdmin>);
    const { result } = renderHook(() => useCommunityTabData('space-1', 'space-1'));

    expect(result.current.pendingMemberships).toEqual([
      expect.objectContaining({ id: 'app-1', canApprove: false, canReject: true, canDelete: true }),
    ]);
  });

  it('an open invitation without CANCEL cannot be revoked or deleted', () => {
    vi.mocked(useCommunityAdmin).mockReturnValue(
      baseAdmin([orgInvitation({ nextEvents: [] }), { ...userInvitation(), nextEvents: [] }]) as ReturnType<
        typeof useCommunityAdmin
      >
    );
    const { result } = renderHook(() => useCommunityTabData('space-1', 'space-1'));

    expect(result.current.pendingOrganizationInvitations[0].canRevoke).toBe(false);
    expect(result.current.pendingMemberships).toEqual([
      expect.objectContaining({ id: 'inv-user-1', canDelete: false }),
    ]);
  });
});
