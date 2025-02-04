import { useMemo } from 'react';
import {
  useAssignRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useCommunityProviderDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  RoleName,
  RoleSetMemberOrganizationFragment,
  RoleSetMemberUserFragment,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import useInviteContributors from '../../../access/_removeMe/useInviteContributors';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';
import useRoleSetApplicationsAndInvitations, {
  InviteContributorsData,
  InviteExternalUserData,
} from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';

// TODO: Inherit from CoreEntityIds when they are not NameIds
interface useCommunityAdminParams {
  roleSetId: string;
  spaceId?: string;
  spaceLevel: SpaceLevel | undefined;
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
  isFacilitating: boolean;
}

const useCommunityAdmin = ({ roleSetId, spaceId, spaceLevel }: useCommunityAdminParams) => {
  const { data: communityProviderData, loading: loadingCommunityProvider } = useCommunityProviderDetailsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel !== SpaceLevel.L0,
  });

  const { users, organizations, virtualContributors, rolesDefinitions, loading, refetch } = useRoleSetManager({
    roleSetId,
    relevantRoles: RELEVANT_ROLES.Community,
  });
  const memberRoleDefinition = rolesDefinitions?.[RoleName.Member];
  const leadRoleDefinition = rolesDefinitions?.[RoleName.Lead];

  const communityProvider = communityProviderData?.lookup.space?.provider;
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
      isFacilitating: communityProvider?.__typename === 'Organization' && communityProvider.id === organization.id,
    }));
    // Add the community provider if it's not yet in the list
    if (communityProvider && communityProvider.__typename === 'Organization') {
      const member = result.find(organization => organization.id === communityProvider.id);
      if (!member) {
        result.push({
          ...communityProvider,
          isMember: false,
          isLead: false,
          isFacilitating: true,
        });
      }
    }
    return result;
  }, [organizations]);

  // Virtual Contributors community related extracted in useInviteContributors
  const {
    permissions,
    // virtualContributors,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    onAddVirtualContributor,
    onRemoveVirtualContributor,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel });

  // Available new members:
  const {
    refetch: refetchAvailableContributors,
    findAvailableUsersForRoleSetEntryRole,
    findAvailableOrganizationsForRoleSet,
  } = useRoleSetAvailableContributors({
    roleSetId,
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
  const [addUserToCommunity] = useAssignRoleToUserMutation();
  const handleAddUser = async (memberId: string) => {
    if (!roleSetId) {
      return;
    }
    await addUserToCommunity({
      variables: {
        roleSetId,
        contributorId: memberId,
        role: RoleName.Member,
      },
    });
    await refetchAvailableContributors();
    return refetch();
  };

  const [addOrganizationToCommunity] = useAssignRoleToOrganizationMutation();
  const handleAddOrganization = async (memberId: string) => {
    if (!roleSetId) {
      return;
    }
    await addOrganizationToCommunity({
      variables: {
        roleSetId,
        contributorId: memberId,
        role: RoleName.Member,
      },
    });
    await refetchAvailableContributors();
    return refetch();
  };

  // Mutations:

  const [assignRoleToUser] = useAssignRoleToUserMutation();
  const [removeRoleFromUser] = useRemoveRoleFromUserMutation();
  const handleUserLeadChange = async (memberId: string, isLead: boolean) => {
    if (!roleSetId) {
      return;
    }
    if (isLead) {
      await assignRoleToUser({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: RoleName.Lead,
        },
      });
    } else {
      await removeRoleFromUser({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: RoleName.Lead,
        },
      });
    }
    return refetch();
  };

  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) => {
    if (!roleSetId) {
      return;
    }
    if (isAdmin) {
      await assignRoleToUser({
        variables: { roleSetId: roleSetId, role: RoleName.Admin, contributorId: memberId },
      });
    } else {
      await removeRoleFromUser({
        variables: { roleSetId: roleSetId, role: RoleName.Admin, contributorId: memberId },
      });
    }
    return refetch();
  };

  const [removeUserAsCommunityMember] = useRemoveRoleFromUserMutation();
  const handleRemoveUser = async (memberId: string) => {
    if (!roleSetId) {
      return;
    }
    await removeUserAsCommunityMember({
      variables: {
        contributorId: memberId,
        roleSetId,
        role: RoleName.Member,
      },
    });
    return refetch();
  };

  const [assignOrganizationAsCommunityLead] = useAssignRoleToOrganizationMutation();
  const [removeOrganizationAsCommunityLeadMutation] = useRemoveRoleFromOrganizationMutation();
  const onOrganizationLeadChange = async (memberId: string, isLead: boolean) => {
    if (!roleSetId) {
      return;
    }
    if (isLead) {
      await assignOrganizationAsCommunityLead({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: RoleName.Lead,
        },
      });
    } else {
      await removeOrganizationAsCommunityLeadMutation({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: RoleName.Lead,
        },
      });
    }
    return refetch();
  };

  const [removeOrganizationAsCommunityMember] = useRemoveRoleFromOrganizationMutation();
  const handleRemoveOrganization = async (memberId: string) => {
    if (!roleSetId) {
      return;
    }
    await removeOrganizationAsCommunityMember({
      variables: {
        contributorId: memberId,
        roleSetId,
        role: RoleName.Member,
      },
    });
    return refetch();
  };

  const {
    applications,
    invitations,
    platformInvitations,
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

  return {
    users: communityUsers,
    organizations: communityOrganizations,
    virtualContributors,
    memberRoleDefinition,
    leadRoleDefinition,
    permissions,
    applications,
    invitations,
    platformInvitations,
    onApplicationStateChange: applicationStateChange,
    onInvitationStateChange: invitationStateChange,
    onUserLeadChange: handleUserLeadChange,
    onUserAuthorizationChange: handleUserAuthorizationChange,
    onOrganizationLeadChange: onOrganizationLeadChange,
    onAddUser: handleAddUser,
    onAddOrganization: handleAddOrganization,
    onAddVirtualContributor,
    onRemoveUser: handleRemoveUser,
    onRemoveOrganization: handleRemoveOrganization,
    onRemoveVirtualContributor,
    onDeleteInvitation: deleteInvitation,
    onDeletePlatformInvitation: deletePlatformInvitation,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    inviteExternalUser,
    loading: loadingCommunityProvider || loading || loadingApplicationsAndInvitations,
  };
};

export default useCommunityAdmin;
