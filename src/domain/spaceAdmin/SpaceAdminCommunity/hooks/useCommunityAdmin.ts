import {
  ActorType,
  AuthorizationPrivilege,
  RoleName,
  type RoleSetMemberOrganizationFragment,
  type RoleSetMemberUserFragment,
} from '@/core/apollo/generated/graphql-schema';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import type { ApplicationModel } from '@/domain/access/model/ApplicationModel';
import type { InviteContributorsData } from '@/domain/access/model/InvitationDataModel';
import type { InvitationModel } from '@/domain/access/model/InvitationModel';
import type { PlatformInvitationModel } from '@/domain/access/model/PlatformInvitationModel';
import type { RoleDefinition } from '@/domain/access/model/RoleDefinitionModel';
import useRoleSetManager, {
  RELEVANT_ROLES,
  type RoleSetMemberVirtualContributorFragmentWithRoles,
} from '@/domain/access/RoleSetManager/useRoleSetManager';

interface useCommunityAdminParams {
  roleSetId: string;
}

export interface useCommunityAdminProvided {
  userAdmin: {
    members: CommunityMemberUserFragmentWithRoles[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<unknown>;
    onAuthorizationChange: (memberId: string, isAdmin: boolean) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    inviteContributors: (inviteData: InviteContributorsData) => Promise<unknown>;
  };
  organizationAdmin: {
    members: CommunityMemberOrganizationFragmentWithRoles[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    inviteContributors: (inviteData: InviteContributorsData) => Promise<unknown>;
  };
  virtualContributorAdmin: {
    members: RoleSetMemberVirtualContributorFragmentWithRoles[];
    onAdd: (memberId: string) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    inviteContributors: (inviteData: InviteContributorsData) => Promise<unknown>;
  };
  membershipAdmin: {
    memberRoleDefinition: RoleDefinition | undefined;
    leadRoleDefinition: RoleDefinition | undefined;
    applications: ApplicationModel[];
    invitations: InvitationModel[];
    platformInvitations: PlatformInvitationModel[];
    onApplicationStateChange: (applicationId: string, eventName: string) => Promise<unknown>;
    onInvitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
    onDeleteInvitation: (invitationId: string) => Promise<unknown>;
    onDeletePlatformInvitation: (invitationId: string) => Promise<unknown>;
    onResendPlatformInvitation: (invitationId: string) => Promise<unknown>;
  };
  permissions: {
    canInvite: boolean;
    canInviteOrganizations: boolean;
    canAddVirtualContributors: boolean;
    canAddVirtualContributorsFromAccount: boolean;
  };
  /**
   * Raw privileges on the role set, alongside the derived booleans above.
   *
   * Consumers that gate a control need this rather than the booleans: a boolean cannot
   * distinguish "still loading" from "denied" from "no privilege list returned", which
   * the gating UI must show differently (spec FR-008 / Edge Case 3).
   */
  myPrivileges: AuthorizationPrivilege[] | undefined;
  loading: boolean;
  errored: boolean;
}

export interface CommunityMemberUserFragmentWithRoles extends RoleSetMemberUserFragment {
  isMember: boolean;
  isLead: boolean;
  isAdmin: boolean;
  isContactable: boolean;
}
export interface CommunityMemberOrganizationFragmentWithRoles extends RoleSetMemberOrganizationFragment {
  isMember: boolean;
  isLead: boolean;
}

const useCommunityAdmin = ({ roleSetId }: useCommunityAdminParams): useCommunityAdminProvided => {
  const {
    users,
    organizations,
    virtualContributors,
    rolesDefinitions,
    assignRoleToUser,
    removeRoleFromUser,
    assignRoleToOrganization,
    removeRoleFromOrganization,
    assignRoleToVirtualContributor,
    removeRoleFromVirtualContributor,
    loading,
    errored: erroredMembers,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: RELEVANT_ROLES.Community,
    contributorTypes: [ActorType.User, ActorType.Organization, ActorType.VirtualContributor],
    fetchContributors: true,
    fetchRoleDefinitions: true,
  });
  const memberRoleDefinition = rolesDefinitions?.[RoleName.Member];
  const leadRoleDefinition = rolesDefinitions?.[RoleName.Lead];

  const communityUsers = users.map<CommunityMemberUserFragmentWithRoles>(user => ({
    ...user,
    isMember: user.roles.includes(RoleName.Member),
    isLead: user.roles.includes(RoleName.Lead),
    isAdmin: user.roles.includes(RoleName.Admin),
  }));

  const communityOrganizations = (() => {
    const result = organizations.map<CommunityMemberOrganizationFragmentWithRoles>(organization => ({
      ...organization,
      isMember: organization.roles.includes(RoleName.Member),
      isLead: organization.roles.includes(RoleName.Lead),
    }));

    return result;
  })();

  const onRemoveUser = (memberId: string) => removeRoleFromUser(memberId, RoleName.Member);

  const onUserLeadChange = (memberId: string, isLead: boolean) =>
    isLead ? assignRoleToUser(memberId, RoleName.Lead) : removeRoleFromUser(memberId, RoleName.Lead);

  const onRemoveOrganization = (memberId: string) => removeRoleFromOrganization(memberId, RoleName.Member);

  const onUserAuthorizationChange = (memberId: string, isAdmin: boolean) =>
    isAdmin ? assignRoleToUser(memberId, RoleName.Admin) : removeRoleFromUser(memberId, RoleName.Admin);

  const onOrganizationLeadChange = (memberId: string, isLead: boolean) =>
    isLead ? assignRoleToOrganization(memberId, RoleName.Lead) : removeRoleFromOrganization(memberId, RoleName.Lead);

  const onAddVirtualContributor = (memberId: string) => assignRoleToVirtualContributor(memberId, RoleName.Member);

  const onRemoveVirtualContributor = (memberId: string) => removeRoleFromVirtualContributor(memberId, RoleName.Member);

  const {
    applications,
    invitations,
    platformInvitations,
    authorizationPrivileges,
    applicationStateChange,
    inviteContributorsOnRoleSet,
    invitationStateChange,
    deleteInvitation,
    deletePlatformInvitation,
    resendPlatformInvitation,
    loading: loadingApplicationsAndInvitations,
    errored: erroredApplicationsAndInvitations,
  } = useRoleSetApplicationsAndInvitations({
    roleSetId,
  });

  const inviteContributors = (inviteData: InviteContributorsData) =>
    inviteContributorsOnRoleSet({ roleSetId, ...inviteData });

  const permissions = {
    // Inviting (incl. by email) is gated by the dedicated invite privilege, which space admins
    // hold. Invitation is the only way users and organizations join (alkem-io/server#6623).
    canInvite: authorizationPrivileges.some(priv => priv === AuthorizationPrivilege.RolesetEntryRoleInvite),
    // Same invite privilege covers organization invitees.
    canInviteOrganizations: authorizationPrivileges.some(
      priv => priv === AuthorizationPrivilege.RolesetEntryRoleInvite
    ),
    canAddVirtualContributors: authorizationPrivileges.some(
      priv => priv === AuthorizationPrivilege.RolesetEntryRoleAssign
    ),
    // the following privilege allows Admins of a space without CommunityAddMember privilege, to
    // be able to add VC from the account; CommunityAddMember overrides this privilege as it's not granted to PAs
    canAddVirtualContributorsFromAccount: authorizationPrivileges.some(
      priv => priv === AuthorizationPrivilege.CommunityAssignVcFromAccount
    ),
  };

  return {
    userAdmin: {
      members: communityUsers,
      onLeadChange: onUserLeadChange,
      onAuthorizationChange: onUserAuthorizationChange,
      onRemove: onRemoveUser,
      inviteContributors,
    },
    organizationAdmin: {
      members: communityOrganizations,
      onLeadChange: onOrganizationLeadChange,
      onRemove: onRemoveOrganization,
      inviteContributors,
    },
    virtualContributorAdmin: {
      members: virtualContributors,
      onAdd: onAddVirtualContributor,
      onRemove: onRemoveVirtualContributor,
      inviteContributors,
    },
    membershipAdmin: {
      memberRoleDefinition,
      leadRoleDefinition,
      applications,
      invitations,
      platformInvitations,
      onApplicationStateChange: applicationStateChange,
      onInvitationStateChange: invitationStateChange,
      onDeleteInvitation: deleteInvitation,
      onDeletePlatformInvitation: deletePlatformInvitation,
      onResendPlatformInvitation: resendPlatformInvitation,
    },
    permissions,
    myPrivileges: authorizationPrivileges,
    loading: loading || loadingApplicationsAndInvitations,
    errored: erroredMembers || erroredApplicationsAndInvitations,
  };
};

export default useCommunityAdmin;
