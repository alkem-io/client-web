import { useMemo } from 'react';
import {
  useAllOrganizationsLazyQuery,
  useEventOnApplicationMutation,
  useCommunityApplicationsInvitationsQuery,
  useInvitationStateEventMutation,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useAssignRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useRoleSetAvailableEntryRoleUsersLazyQuery,
  useCommunityProviderDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  RoleName,
  RoleSetMemberOrganizationFragment,
  RoleSetMemberUserFragment,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import useInviteUsers from '@/domain/community/invitations/useInviteUsers';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import useInviteContributors from '../../inviteContributors/useInviteContributors';
import useRoleSetAdmin, { RELEVANT_ROLES } from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';


// TODO: Inherit from CoreEntityIds when they are not NameIds
interface useCommunityAdminParams {
  roleSetId: string;
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
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

const useCommunityAdmin = ({ roleSetId, spaceId, challengeId, opportunityId, spaceLevel }: useCommunityAdminParams) => {
  const journeyTypeName = getJourneyTypeName({
    spaceNameId: spaceId,
    challengeNameId: challengeId,
    opportunityNameId: opportunityId,
  })!;
  const { data: communityProviderData, loading: loadingCommunityProvider } = useCommunityProviderDetailsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || journeyTypeName !== 'space',
  });

  const { users, organizations, virtualContributors, rolesDefinitions, loading, refetch } = useRoleSetAdmin({
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


  const {
    data: dataApplications,
    loading: loadingApplications,
    refetch: refetchApplicationsAndInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    variables: { roleSetId },
    skip: !roleSetId,
  });

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
  const [fetchAvailableUsers, { refetch: refetchAvailableMemberUsers }] = useRoleSetAvailableEntryRoleUsersLazyQuery();
  const getAvailableUsers = async (filter: string | undefined) => {
    const { data } = await fetchAvailableUsers({
      variables: {
        roleSetId,
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildUserFilterObject(filter),
      },
    });
    return data?.lookup.availableEntryRoleUsers?.availableUsersForEntryRole?.users;
  };

  const [fetchAllOrganizations, { refetch: refetchAvailableMemberOrganizations }] = useAllOrganizationsLazyQuery();
  const getAvailableOrganizations = async (filter: string | undefined) => {
    const { data } = await fetchAllOrganizations({
      variables: {
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildOrganizationFilterObject(filter),
      },
    });
    // Filter out organizations that already have a role in the community
    return data?.organizationsPaginated.organization.filter(
      org => organizations.find(member => member.id === org.id) === undefined
    );
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
    await refetchAvailableMemberUsers();
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
    await refetchAvailableMemberOrganizations();
    return refetch();
  };

  // Mutations:
  const [updateApplication] = useEventOnApplicationMutation({});
  const handleApplicationStateChange = async (applicationId: string, newState: string) => {
    await updateApplication({
      variables: {
        input: {
          applicationID: applicationId,
          eventName: newState,
        },
      },
    });
    return refetch();
  };

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

  const onInviteUser = async () => {
    await refetchApplicationsAndInvitations();
  };

  const { inviteContributor: inviteExistingUser, platformInviteToCommunity: inviteExternalUser } = useInviteUsers(
    roleSetId,
    {
      onInviteContributor: onInviteUser,
      onInviteExternalUser: onInviteUser,
    }
  );

  const [sendInvitationStateEvent] = useInvitationStateEventMutation();

  const [deleteInvitation] = useDeleteInvitationMutation();
  const [deletePlatformInvitation] = useDeletePlatformInvitationMutation();

  const handleInvitationStateChange = async (invitationId: string, eventName: string) => {
    await sendInvitationStateEvent({
      variables: {
        invitationId,
        eventName,
      },
    });
    await refetchApplicationsAndInvitations();
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    await deleteInvitation({
      variables: {
        invitationId,
      },
    });
    await refetchApplicationsAndInvitations();
  };
  const handleDeletePlatformInvitation = async (invitationId: string) => {
    await deletePlatformInvitation({
      variables: {
        invitationId,
      },
    });
    await refetchApplicationsAndInvitations();
  };
  const roleSetPending = dataApplications?.lookup.roleSet;

  return {
    users: communityUsers,
    organizations: communityOrganizations,
    virtualContributors,
    memberRoleDefinition,
    leadRoleDefinition,
    permissions,
    applications: roleSetPending?.applications,
    invitations: roleSetPending?.invitations,
    platformInvitations: roleSetPending?.platformInvitations,
    onApplicationStateChange: handleApplicationStateChange,
    onInvitationStateChange: handleInvitationStateChange,
    onUserLeadChange: handleUserLeadChange,
    onUserAuthorizationChange: handleUserAuthorizationChange,
    onOrganizationLeadChange: onOrganizationLeadChange,
    onAddUser: handleAddUser,
    onAddOrganization: handleAddOrganization,
    onAddVirtualContributor,
    onRemoveUser: handleRemoveUser,
    onRemoveOrganization: handleRemoveOrganization,
    onRemoveVirtualContributor,
    onDeleteInvitation: handleDeleteInvitation,
    onDeletePlatformInvitation: handleDeletePlatformInvitation,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    inviteExternalUser,
    loading: loadingCommunityProvider || loading || loadingApplications,
  };
};

export default useCommunityAdmin;
