import type {
  CommunityMember,
  CommunityOrg,
  CommunityVC,
  PendingApplication,
  PendingInvitation,
} from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';

export type UseCommunityTabDataResult = {
  users: CommunityMember[];
  organizations: CommunityOrg[];
  virtualContributors: CommunityVC[];
  applications: PendingApplication[];
  invitations: PendingInvitation[];
  permissions: {
    canAddUsers: boolean;
    canAddOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  onUserLeadChange: (id: string, isLead: boolean) => void;
  onUserAdminChange: (id: string, isAdmin: boolean) => void;
  onUserRemove: (id: string) => void;
  onOrgLeadChange: (id: string, isLead: boolean) => void;
  onOrgRemove: (id: string) => void;
  onVCRemove: (id: string) => void;
  onApplicationApprove: (id: string) => void;
  onApplicationReject: (id: string) => void;
  onInvitationDelete: (id: string) => void;
  onPlatformInvitationDelete: (id: string) => void;
  loading: boolean;
};

export function useCommunityTabData(roleSetId: string): UseCommunityTabDataResult {
  const community = useCommunityAdmin({ roleSetId });

  const users: CommunityMember[] = community.userAdmin.members.map(u => ({
    id: u.id,
    displayName: u.profile?.displayName ?? '',
    email: u.email,
    avatarUrl: u.profile?.avatar?.uri,
    url: u.profile?.url,
    isMember: u.isMember,
    isLead: u.isLead,
    isAdmin: u.isAdmin,
    isContactable: u.isContactable,
  }));

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

  const applications: PendingApplication[] = community.membershipAdmin.applications
    .filter(a => a.state === 'new')
    .map(a => ({
      id: a.id,
      displayName: a.actor.profile?.displayName ?? '',
      email: a.actor.profile?.email,
      createdDate: a.createdDate instanceof Date ? a.createdDate.toLocaleDateString() : String(a.createdDate),
    }));

  const invitations: PendingInvitation[] = [
    ...community.membershipAdmin.invitations
      .filter(inv => inv.state === 'invited')
      .map(inv => ({
        id: inv.id,
        displayName: inv.actor.profile?.displayName ?? '',
        email: inv.actor.profile?.email,
        createdDate: inv.createdDate instanceof Date ? inv.createdDate.toLocaleDateString() : String(inv.createdDate),
        isPlatformInvitation: false as const,
      })),
    ...community.membershipAdmin.platformInvitations.map(inv => ({
      id: inv.id,
      displayName: inv.email,
      email: inv.email,
      createdDate:
        inv.createdDate instanceof Date
          ? inv.createdDate?.toLocaleDateString()
          : inv.createdDate
            ? String(inv.createdDate)
            : '',
      isPlatformInvitation: true as const,
    })),
  ];

  const onUserLeadChange = (id: string, isLead: boolean) => {
    void community.userAdmin.onLeadChange(id, isLead);
  };

  const onUserAdminChange = (id: string, isAdmin: boolean) => {
    void community.userAdmin.onAuthorizationChange(id, isAdmin);
  };

  const onUserRemove = (id: string) => {
    void community.userAdmin.onRemove(id);
  };

  const onOrgLeadChange = (id: string, isLead: boolean) => {
    void community.organizationAdmin.onLeadChange(id, isLead);
  };

  const onOrgRemove = (id: string) => {
    void community.organizationAdmin.onRemove(id);
  };

  const onVCRemove = (id: string) => {
    void community.virtualContributorAdmin.onRemove(id);
  };

  const onApplicationApprove = (id: string) => {
    void community.membershipAdmin.onApplicationStateChange(id, 'approve');
  };

  const onApplicationReject = (id: string) => {
    void community.membershipAdmin.onApplicationStateChange(id, 'reject');
  };

  const onInvitationDelete = (id: string) => {
    void community.membershipAdmin.onDeleteInvitation(id);
  };

  const onPlatformInvitationDelete = (id: string) => {
    void community.membershipAdmin.onDeletePlatformInvitation(id);
  };

  return {
    users,
    organizations,
    virtualContributors,
    applications,
    invitations,
    permissions: community.permissions,
    onUserLeadChange,
    onUserAdminChange,
    onUserRemove,
    onOrgLeadChange,
    onOrgRemove,
    onVCRemove,
    onApplicationApprove,
    onApplicationReject,
    onInvitationDelete,
    onPlatformInvitationDelete,
    loading: community.loading,
  };
}
