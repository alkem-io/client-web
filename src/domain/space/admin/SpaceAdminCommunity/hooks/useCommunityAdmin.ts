import { useMemo } from 'react';
import {
  AuthorizationPrivilege,
  RoleName,
  RoleSetContributorType,
  RoleSetMemberOrganizationFragment,
  RoleSetMemberUserFragment,
} from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager, {
  RELEVANT_ROLES,
  RoleSetMemberVirtualContributorFragmentWithRoles,
} from '@/domain/access/RoleSetManager/useRoleSetManager';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';
import useRoleSetApplicationsAndInvitations, {
  InviteContributorsData,
  InviteExternalUserData,
} from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import { RoleDefinition } from '@/domain/access/model/RoleDefinitionModel';
import { ApplicationModel } from '@/domain/access/model/ApplicationModel';
import { InvitationModel } from '@/domain/access/model/InvitationModel';
import { PlatformInvitationModel } from '@/domain/access/model/PlatformInvitationModel';

interface useCommunityAdminParams {
  roleSetId: string;
}

export interface useCommunityAdminProvided {
  userAdmin: {
    members: CommunityMemberUserFragmentWithRoles[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<unknown>;
    onAuthorizationChange: (memberId: string, isAdmin: boolean) => Promise<unknown>;
    onAdd: (memberId: string) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    getAvailable: (filter: string | undefined) => Promise<
      {
        id: string;
        profile: {
          displayName: string;
        };
        email?: string;
      }[]
    >;
    inviteExisting: (inviteData: InviteContributorsData) => Promise<unknown>;
    inviteExternal: (inviteData: InviteExternalUserData) => Promise<unknown>;
  };
  organizationAdmin: {
    members: CommunityMemberOrganizationFragmentWithRoles[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<unknown>;
    onAdd: (memberId: string) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    getAvailable: (filter: string | undefined) => Promise<
      {
        id: string;
        profile: {
          displayName: string;
        };
      }[]
    >;
  };
  virtualContributorAdmin: {
    members: RoleSetMemberVirtualContributorFragmentWithRoles[];
    onAdd: (memberId: string) => Promise<unknown>;
    onRemove: (memberId: string) => Promise<unknown>;
    inviteExisting: (inviteData: InviteContributorsData) => Promise<unknown>;
  };
  membershipAdmin: {
    memberRoleDefinition: RoleDefinition | undefined;
    leadRoleDefinition: RoleDefinition | undefined;
    applications: ApplicationModel[];
    invitations: InvitationModel[];
    platformInvitations: PlatformInvitationModel[];
    onApplicationStateChange: (roleSetId: string, eventName: string) => Promise<unknown>;
    onInvitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
    onDeleteInvitation: (invitationId: string) => Promise<unknown>;
    onDeletePlatformInvitation: (invitationId: string) => Promise<unknown>;
  };
  permissions: {
    canAddMembers: boolean;
    canAddVirtualContributorsFromAccount: boolean;
  };
  loading: boolean;
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
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: RELEVANT_ROLES.Community,
    contributorTypes: [
      RoleSetContributorType.User,
      RoleSetContributorType.Organization,
      RoleSetContributorType.Virtual,
    ],
    fetchContributors: true,
    fetchRoleDefinitions: true,
    onChange: () => refetchAvailableContributors(),
  });
  const memberRoleDefinition = rolesDefinitions?.[RoleName.Member];
  const leadRoleDefinition = rolesDefinitions?.[RoleName.Lead];

  const communityUsers = useMemo(
    () =>
      users.map<CommunityMemberUserFragmentWithRoles>(user => ({
        ...user,
        isMember: user.roles.includes(RoleName.Member),
        isLead: user.roles.includes(RoleName.Lead),
        isAdmin: user.roles.includes(RoleName.Admin),
      })),
    [users]
  );

  const communityOrganizations = useMemo(() => {
    const result = organizations.map<CommunityMemberOrganizationFragmentWithRoles>(organization => ({
      ...organization,
      isMember: organization.roles.includes(RoleName.Member),
      isLead: organization.roles.includes(RoleName.Lead),
    }));

    return result;
  }, [organizations]);

  // Available new members:
  const {
    refetch: refetchAvailableContributors,
    findAvailableUsersForRoleSetEntryRole,
    findAvailableOrganizationsForRoleSet,
  } = useRoleSetAvailableContributors({
    roleSetId,
    filterCurrentMembers: [...communityUsers, ...communityOrganizations],
  });

  const getAvailableUsers = async (filter: string | undefined) => {
    const { users } = await findAvailableUsersForRoleSetEntryRole(filter);
    return users;
  };
  const getAvailableOrganizations = async (filter: string | undefined) => {
    const { organizations } = await findAvailableOrganizationsForRoleSet(filter);
    return organizations;
  };

  // Adding new members:
  const onAddUser = (memberId: string) => assignRoleToUser(memberId, RoleName.Member);

  const onRemoveUser = (memberId: string) => removeRoleFromUser(memberId, RoleName.Member);

  const onUserLeadChange = (memberId: string, isLead: boolean) =>
    isLead ? assignRoleToUser(memberId, RoleName.Lead) : removeRoleFromUser(memberId, RoleName.Lead);

  const onRemoveOrganization = (memberId: string) => removeRoleFromOrganization(memberId, RoleName.Member);

  const onUserAuthorizationChange = (memberId: string, isAdmin: boolean) =>
    isAdmin ? assignRoleToUser(memberId, RoleName.Admin) : removeRoleFromUser(memberId, RoleName.Admin);

  const onAddOrganization = (memberId: string) => assignRoleToOrganization(memberId, RoleName.Member);

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
    inviteContributorOnRoleSet,
    inviteContributorOnPlatformRoleSet,
    invitationStateChange,
    deleteInvitation,
    deletePlatformInvitation,
    loading: loadingApplicationsAndInvitations,
  } = useRoleSetApplicationsAndInvitations({
    roleSetId,
  });

  const inviteExistingUser = (inviteData: InviteContributorsData) =>
    inviteContributorOnRoleSet({ roleSetId, ...inviteData });
  const inviteExternalUser = (inviteData: InviteExternalUserData) =>
    inviteContributorOnPlatformRoleSet({ roleSetId, ...inviteData });

  const inviteExistingVirtualContributor = (inviteData: InviteContributorsData) =>
    inviteContributorOnRoleSet({ roleSetId, ...inviteData });

  const permissions = {
    canAddMembers: authorizationPrivileges.some(priv => priv === AuthorizationPrivilege.RolesetEntryRoleAssign),
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
      onAdd: onAddUser,
      onRemove: onRemoveUser,
      getAvailable: getAvailableUsers,
      inviteExisting: inviteExistingUser,
      inviteExternal: inviteExternalUser,
    },
    organizationAdmin: {
      members: communityOrganizations,
      onLeadChange: onOrganizationLeadChange,
      onAdd: onAddOrganization,
      onRemove: onRemoveOrganization,
      getAvailable: getAvailableOrganizations,
    },
    virtualContributorAdmin: {
      members: virtualContributors,
      onAdd: onAddVirtualContributor,
      onRemove: onRemoveVirtualContributor,
      inviteExisting: inviteExistingVirtualContributor,
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
    },
    permissions,
    loading: loading || loadingApplicationsAndInvitations,
  };
};

export default useCommunityAdmin;
