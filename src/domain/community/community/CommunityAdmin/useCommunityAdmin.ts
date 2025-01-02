import { useMemo } from 'react';
import {
  useAllOrganizationsLazyQuery,
  useEventOnApplicationMutation,
  useCommunityApplicationsInvitationsQuery,
  useInvitationStateEventMutation,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useCommunityMembersListQuery,
  useAssignRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useRoleSetAvailableMembersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { CommunityRoleType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { OrganizationDetailsFragmentWithRoles } from '@/domain/community/community/CommunityAdmin/CommunityOrganizations';
import { CommunityMemberUserFragmentWithRoles } from '@/domain/community/community/CommunityAdmin/CommunityUsers';
import useInviteUsers from '@/domain/community/invitations/useInviteUsers';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import useInviteContributors from '../../inviteContributors/useInviteContributors';

const MAX_AVAILABLE_MEMBERS = 100;
const buildUserFilterObject = (filter: string | undefined) =>
  filter
    ? {
        email: filter,
        displayName: filter,
      }
    : undefined;

const buildOrganizationFilterObject = (filter: string | undefined) =>
  filter
    ? {
        displayName: filter,
      }
    : undefined;

// TODO: Inherit from CoreEntityIds when they are not NameIds
interface useRoleSetAdminParams {
  roleSetId: string;
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
  spaceLevel: SpaceLevel | undefined;
}

const useRoleSetAdmin = ({ roleSetId, spaceId, challengeId, opportunityId, spaceLevel }: useRoleSetAdminParams) => {
  const journeyTypeName = getJourneyTypeName({
    spaceNameId: spaceId,
    challengeNameId: challengeId,
    opportunityNameId: opportunityId,
  })!;

  const {
    data: roleSetData,
    loading: loadingMembers,
    refetch: refetchCommunityMembers,
  } = useCommunityMembersListQuery({
    variables: {
      roleSetId,
      spaceId,
      includeSpaceHost: journeyTypeName === 'space',
    },
    skip: !roleSetId || !spaceId,
  });

  const roleSet = roleSetData?.lookup.roleSet;

  const memberRoleDefinition = roleSet?.memberRoleDefinition;
  const leadRoleDefinition = roleSet?.leadRoleDefinition;

  const {
    data: dataApplications,
    loading: loadingApplications,
    refetch: refetchApplicationsAndInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    variables: { roleSetId },
    skip: !roleSetId,
  });

  // Members:
  const users = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;
    const members = roleSet?.memberUsers ?? [];
    const leads = roleSet?.leadUsers ?? [];
    const admins = roleSet?.adminUsers ?? [];

    const result = members.map<CommunityMemberUserFragmentWithRoles>(user => ({
      ...user,
      isMember: true,
      isLead: leads.find(lead => lead.id === user.id) !== undefined,
      isAdmin: admins.find(admins => admins.id === user.id) !== undefined,
      isContactable: user.isContactable,
    }));

    // Push the rest of the leads that are not yet in the list of members
    leads.forEach(lead => {
      const member = result.find(user => user.id === lead.id);
      if (!member) {
        result.push({
          ...lead,
          isMember: false,
          isLead: true,
          isAdmin: admins.find(admins => admins.id === lead.id) !== undefined,
          isContactable: lead.isContactable,
        });
      }
    });

    // Push the admins that are not yet in the list of members and leads
    admins.forEach(admin => {
      const member = result.find(user => user.id === admin.id);
      if (!member) {
        result.push({
          ...admin,
          isMember: false,
          isLead: false,
          isAdmin: true,
          isContactable: admin.isContactable,
        });
      }
    });

    return result;
  }, [roleSetData]);

  const organizations = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;
    const members = roleSet?.memberOrganizations ?? [];
    const leads = roleSet?.leadOrganizations ?? [];

    const result = members.map<OrganizationDetailsFragmentWithRoles>(member => ({
      ...member,
      isMember: true,
      isLead: leads.find(lead => lead.id === member.id) !== undefined,
      isFacilitating: roleSetData?.lookup.space?.provider.id === member.id,
      isContactable: false, // TODO: Implement contactable for organizations
    }));

    // Push the rest of the leads that are not yet in the list of members
    leads.forEach(lead => {
      const member = result.find(organization => organization.id === lead.id);
      if (!member) {
        result.push({
          ...lead,
          isMember: false,
          isLead: true,
          isFacilitating: roleSetData?.lookup.space?.provider.id === lead.id,
          isContactable: false, // TODO: Implement contactable for organizations
        });
      }
    });

    // Add Facilitating if it's not yet in the result
    if (roleSetData?.lookup.space?.provider) {
      const member = result.find(organization => organization.id === roleSetData.lookup.space?.provider.id);
      if (!member) {
        result.push({
          ...roleSetData.lookup.space.provider,
          isMember: false,
          isLead: false,
          isFacilitating: true,
          isContactable: false,
        });
      }
    }
    return result;
  }, [roleSetData]);

  // Virtual Contributors community related extracted in useInviteContributors
  const {
    permissions,
    virtualContributors,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    onAddVirtualContributor,
    onRemoveVirtualContributor,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel });

  // Available new members:
  const [fetchAvailableUsers, { refetch: refetchAvailableMemberUsers }] = useRoleSetAvailableMembersLazyQuery();
  const getAvailableUsers = async (filter: string | undefined) => {
    const { data } = await fetchAvailableUsers({
      variables: {
        roleSetId,
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildUserFilterObject(filter),
      },
    });
    return data?.lookup.availableMembers?.availableUsersForMemberRole?.users;
  };

  const [fetchAllOrganizations, { refetch: refetchAvailableMemberOrganizations }] = useAllOrganizationsLazyQuery();
  const getAvailableOrganizations = async (filter: string | undefined) => {
    const { data } = await fetchAllOrganizations({
      variables: {
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildOrganizationFilterObject(filter),
      },
    });
    // Filter out already member organizations
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
        role: CommunityRoleType.Member,
      },
    });
    await refetchAvailableMemberUsers();
    return refetchCommunityMembers();
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
        role: CommunityRoleType.Member,
      },
    });
    await refetchAvailableMemberOrganizations();
    return refetchCommunityMembers();
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
    return refetchCommunityMembers();
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
          role: CommunityRoleType.Lead,
        },
      });
    } else {
      await removeRoleFromUser({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: CommunityRoleType.Lead,
        },
      });
    }
    return refetchCommunityMembers();
  };

  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) => {
    if (!roleSetId) {
      return;
    }
    if (isAdmin) {
      await assignRoleToUser({
        variables: { roleSetId: roleSetId, role: CommunityRoleType.Admin, contributorId: memberId },
      });
    } else {
      await removeRoleFromUser({
        variables: { roleSetId: roleSetId, role: CommunityRoleType.Admin, contributorId: memberId },
      });
    }
    return refetchCommunityMembers();
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
        role: CommunityRoleType.Member,
      },
    });
    return refetchCommunityMembers();
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
          role: CommunityRoleType.Lead,
        },
      });
    } else {
      await removeOrganizationAsCommunityLeadMutation({
        variables: {
          contributorId: memberId,
          roleSetId,
          role: CommunityRoleType.Lead,
        },
      });
    }
    return refetchCommunityMembers();
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
        role: CommunityRoleType.Member,
      },
    });
    return refetchCommunityMembers();
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
    users,
    organizations,
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
    loading: loadingMembers || loadingApplications,
  };
};

export default useRoleSetAdmin;
