import { useState } from 'react';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type {
  PendingMembership,
  PendingMembershipContributorType,
  PendingMembershipState,
  PendingMembershipType,
} from '@/crd/components/space/settings/PendingMembershipsTable';
import type {
  CommunityMember,
  CommunityOrg,
  CommunityVC,
} from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import {
  ApplicationEvent,
  ApplicationState,
  InvitationEvent,
  InvitationState,
} from '@/domain/community/invitations/InvitationApplicationConstants';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';

export type CommunityPendingRemoval =
  | { kind: 'user'; id: string; name: string }
  | { kind: 'organization'; id: string; name: string }
  | { kind: 'virtualContributor'; id: string; name: string }
  | { kind: 'applicationReject'; id: string; name: string }
  | {
      kind: 'pendingDelete';
      id: string;
      name: string;
      membershipType: PendingMembershipType;
      state: PendingMembershipState;
    };

export type UseCommunityTabDataResult = {
  members: CommunityMember[];
  pendingMemberships: PendingMembership[];
  organizations: CommunityOrg[];
  virtualContributors: CommunityVC[];
  permissions: {
    canAddUsers: boolean;
    canAddOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  onUserRemove: (id: string) => void;
  onOrgRemove: (id: string) => void;
  onVCRemove: (id: string) => void;
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingDelete: (id: string) => void;
  loading: boolean;
  pendingRemoval: CommunityPendingRemoval | null;
  confirmRemoval: () => Promise<void>;
  cancelRemoval: () => void;
  _adminRef: ReturnType<typeof useCommunityAdmin>;
};

const toDateString = (d: Date | string | undefined | null): string => {
  if (!d) return '';
  if (d instanceof Date) return d.toLocaleDateString();
  return String(d);
};

const mapActorType = (t: ActorType | undefined): PendingMembershipContributorType => {
  if (t === ActorType.Organization) return 'organization';
  if (t === ActorType.VirtualContributor) return 'virtualContributor';
  return 'user';
};

const mapApplicationState = (state: string): PendingMembershipState | null => {
  switch (state) {
    case ApplicationState.NEW:
      return 'new';
    case ApplicationState.APPROVED:
      return 'approved';
    case ApplicationState.REJECTED:
      return 'rejected';
    default:
      return null;
  }
};

const mapInvitationState = (state: string): PendingMembershipState | null => {
  switch (state) {
    case InvitationState.INVITED:
      return 'invited';
    case InvitationState.ACCEPTED:
      return 'accepted';
    case InvitationState.REJECTED:
      return 'rejected';
    default:
      return null;
  }
};

export function useCommunityTabData(roleSetId: string): UseCommunityTabDataResult {
  const community = useCommunityAdmin({ roleSetId });
  const [pendingRemoval, setPendingRemoval] = useState<CommunityPendingRemoval | null>(null);

  const members: CommunityMember[] = community.userAdmin.members.map(u => {
    const roleLabel = u.isAdmin ? 'Admin' : u.isLead ? 'Lead' : 'Member';
    return {
      id: u.id,
      displayName: u.profile?.displayName ?? '',
      email: u.email,
      avatarUrl: u.profile?.avatar?.uri,
      url: u.profile?.url,
      roleLabel,
      joinedDate: '',
    };
  });

  const applicationMemberships: PendingMembership[] = community.membershipAdmin.applications
    .map<PendingMembership | null>(app => {
      const state = mapApplicationState(app.state);
      if (!state) return null;
      return {
        id: app.id,
        type: 'application' as const,
        state,
        contributorType: mapActorType(app.contributorType),
        displayName: app.actor.profile?.displayName ?? '',
        email: app.actor.profile?.email,
        url: app.actor.profile?.url,
        createdDate: toDateString(app.createdDate),
        canApprove: state === 'new',
        canReject: state === 'new',
        canDelete: state !== 'approved',
      };
    })
    .filter((x): x is PendingMembership => x !== null);

  const invitationMemberships: PendingMembership[] = community.membershipAdmin.invitations
    .map<PendingMembership | null>(inv => {
      const state = mapInvitationState(inv.state);
      if (!state) return null;
      return {
        id: inv.id,
        type: 'invitation' as const,
        state,
        contributorType: mapActorType(inv.contributorType),
        displayName: inv.actor.profile?.displayName ?? '',
        email: inv.actor.profile?.email,
        url: inv.actor.profile?.url,
        createdDate: toDateString(inv.createdDate),
        canApprove: false,
        canReject: false,
        canDelete: true,
      };
    })
    .filter((x): x is PendingMembership => x !== null);

  const platformInvitationMemberships: PendingMembership[] = community.membershipAdmin.platformInvitations.map(inv => ({
    id: inv.id,
    type: 'platformInvitation' as const,
    state: 'invited' as const,
    contributorType: 'user' as const,
    displayName: inv.email,
    email: inv.email,
    url: undefined,
    createdDate: toDateString(inv.createdDate),
    canApprove: false,
    canReject: false,
    canDelete: true,
  }));

  const pendingMemberships: PendingMembership[] = [
    ...applicationMemberships,
    ...invitationMemberships,
    ...platformInvitationMemberships,
  ];

  const organizations: CommunityOrg[] = community.organizationAdmin.members.map(o => ({
    id: o.id,
    displayName: o.profile?.displayName ?? '',
    avatarUrl: o.profile?.avatar?.uri,
    url: o.profile?.url,
    isMember: o.isMember,
    isLead: o.isLead,
  }));

  const virtualContributors: CommunityVC[] = community.virtualContributorAdmin.members.map(vc => ({
    id: vc.id,
    displayName: vc.profile?.displayName ?? '',
    url: vc.profile?.url,
  }));

  const findName = (list: { id: string; displayName: string }[], id: string) =>
    list.find(item => item.id === id)?.displayName ?? '';
  const findPending = (id: string) => pendingMemberships.find(item => item.id === id);

  const onUserRemove = (id: string) => {
    setPendingRemoval({ kind: 'user', id, name: findName(members, id) });
  };
  const onOrgRemove = (id: string) => {
    setPendingRemoval({ kind: 'organization', id, name: findName(organizations, id) });
  };
  const onVCRemove = (id: string) => {
    setPendingRemoval({ kind: 'virtualContributor', id, name: findName(virtualContributors, id) });
  };

  const onPendingApprove = (id: string) => {
    const item = findPending(id);
    if (item?.type === 'application' && item.state === 'new') {
      void community.membershipAdmin.onApplicationStateChange(id, ApplicationEvent.APPROVE);
    }
  };
  const onPendingReject = (id: string) => {
    const item = findPending(id);
    if (item?.type === 'application' && item.state === 'new') {
      setPendingRemoval({ kind: 'applicationReject', id, name: item.displayName });
    }
  };
  const onPendingDelete = (id: string) => {
    const item = findPending(id);
    if (!item || !item.canDelete) return;
    setPendingRemoval({
      kind: 'pendingDelete',
      id,
      name: item.displayName,
      membershipType: item.type,
      state: item.state,
    });
  };

  const cancelRemoval = () => setPendingRemoval(null);

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    const target = pendingRemoval;
    setPendingRemoval(null);
    switch (target.kind) {
      case 'user':
        await community.userAdmin.onRemove(target.id);
        return;
      case 'organization':
        await community.organizationAdmin.onRemove(target.id);
        return;
      case 'virtualContributor':
        await community.virtualContributorAdmin.onRemove(target.id);
        return;
      case 'applicationReject':
        await community.membershipAdmin.onApplicationStateChange(target.id, ApplicationEvent.REJECT);
        return;
      case 'pendingDelete':
        if (target.membershipType === 'application') {
          if (target.state === 'new') {
            await community.membershipAdmin.onApplicationStateChange(target.id, ApplicationEvent.REJECT);
            await community.membershipAdmin.onApplicationStateChange(target.id, ApplicationEvent.ARCHIVE);
          } else if (target.state === 'rejected') {
            await community.membershipAdmin.onApplicationStateChange(target.id, ApplicationEvent.ARCHIVE);
          }
        } else if (target.membershipType === 'invitation') {
          if (target.state === 'invited') {
            await community.membershipAdmin.onDeleteInvitation(target.id);
          } else {
            await community.membershipAdmin.onInvitationStateChange(target.id, InvitationEvent.ARCHIVE);
          }
        } else if (target.membershipType === 'platformInvitation') {
          await community.membershipAdmin.onDeletePlatformInvitation(target.id);
        }
        return;
    }
  };

  return {
    members,
    pendingMemberships,
    organizations,
    virtualContributors,
    permissions: community.permissions,
    onUserRemove,
    onOrgRemove,
    onVCRemove,
    onPendingApprove,
    onPendingReject,
    onPendingDelete,
    loading: community.loading,
    pendingRemoval,
    confirmRemoval,
    cancelRemoval,
    _adminRef: community,
  };
}
