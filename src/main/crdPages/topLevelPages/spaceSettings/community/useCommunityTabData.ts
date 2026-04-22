import { useState } from 'react';
import type {
  CommunityMember,
  CommunityOrg,
  CommunityVC,
} from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';

export type CommunityPendingRemoval =
  | { kind: 'user'; id: string; name: string }
  | { kind: 'organization'; id: string; name: string }
  | { kind: 'virtualContributor'; id: string; name: string }
  | { kind: 'invitation'; id: string; name: string }
  | { kind: 'platformInvitation'; id: string; name: string }
  | { kind: 'applicationReject'; id: string; name: string };

export type UseCommunityTabDataResult = {
  members: CommunityMember[];
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
  onApplicationApprove: (id: string) => void;
  onApplicationReject: (id: string) => void;
  onInvitationDelete: (id: string) => void;
  onPlatformInvitationDelete: (id: string) => void;
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

export function useCommunityTabData(roleSetId: string): UseCommunityTabDataResult {
  const community = useCommunityAdmin({ roleSetId });
  const [pendingRemoval, setPendingRemoval] = useState<CommunityPendingRemoval | null>(null);

  const activeMembers: CommunityMember[] = community.userAdmin.members.map(u => {
    const roleLabel = u.isAdmin ? 'Admin' : u.isLead ? 'Lead' : 'Member';
    return {
      id: u.id,
      source: 'user' as const,
      status: 'active' as const,
      displayName: u.profile?.displayName ?? '',
      email: u.email,
      avatarUrl: u.profile?.avatar?.uri,
      url: u.profile?.url,
      roleLabel,
      joinedDate: '',
    };
  });

  const applicationMembers: CommunityMember[] = community.membershipAdmin.applications
    .filter(a => a.state === 'new')
    .map(a => ({
      id: a.id,
      source: 'application' as const,
      status: 'pending' as const,
      displayName: a.actor.profile?.displayName ?? '',
      email: a.actor.profile?.email,
      avatarUrl: undefined,
      url: a.actor.profile?.url,
      roleLabel: 'Member',
      joinedDate: toDateString(a.createdDate),
    }));

  const invitationMembers: CommunityMember[] = [
    ...community.membershipAdmin.invitations
      .filter(inv => inv.state === 'invited')
      .map(inv => ({
        id: inv.id,
        source: 'invitation' as const,
        status: 'invited' as const,
        displayName: inv.actor.profile?.displayName ?? '',
        email: inv.actor.profile?.email,
        avatarUrl: undefined,
        url: inv.actor.profile?.url,
        roleLabel: 'Member',
        joinedDate: toDateString(inv.createdDate),
        isPlatformInvitation: false,
      })),
    ...community.membershipAdmin.platformInvitations.map(inv => ({
      id: inv.id,
      source: 'platformInvitation' as const,
      status: 'invited' as const,
      displayName: inv.email,
      email: inv.email,
      avatarUrl: undefined,
      url: undefined,
      roleLabel: 'Member',
      joinedDate: toDateString(inv.createdDate),
      isPlatformInvitation: true,
    })),
  ];

  const members: CommunityMember[] = [...applicationMembers, ...invitationMembers, ...activeMembers];

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

  const onUserRemove = (id: string) => {
    setPendingRemoval({ kind: 'user', id, name: findName(members, id) });
  };
  const onOrgRemove = (id: string) => {
    setPendingRemoval({ kind: 'organization', id, name: findName(organizations, id) });
  };
  const onVCRemove = (id: string) => {
    setPendingRemoval({ kind: 'virtualContributor', id, name: findName(virtualContributors, id) });
  };
  const onApplicationApprove = (id: string) => {
    void community.membershipAdmin.onApplicationStateChange(id, 'approve');
  };
  const onApplicationReject = (id: string) => {
    setPendingRemoval({ kind: 'applicationReject', id, name: findName(members, id) });
  };
  const onInvitationDelete = (id: string) => {
    setPendingRemoval({ kind: 'invitation', id, name: findName(members, id) });
  };
  const onPlatformInvitationDelete = (id: string) => {
    setPendingRemoval({ kind: 'platformInvitation', id, name: findName(members, id) });
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
      case 'invitation':
        await community.membershipAdmin.onDeleteInvitation(target.id);
        return;
      case 'platformInvitation':
        await community.membershipAdmin.onDeletePlatformInvitation(target.id);
        return;
      case 'applicationReject':
        await community.membershipAdmin.onApplicationStateChange(target.id, 'reject');
        return;
    }
  };

  return {
    members,
    organizations,
    virtualContributors,
    permissions: community.permissions,
    onUserRemove,
    onOrgRemove,
    onVCRemove,
    onApplicationApprove,
    onApplicationReject,
    onInvitationDelete,
    onPlatformInvitationDelete,
    loading: community.loading,
    pendingRemoval,
    confirmRemoval,
    cancelRemoval,
    _adminRef: community,
  };
}
