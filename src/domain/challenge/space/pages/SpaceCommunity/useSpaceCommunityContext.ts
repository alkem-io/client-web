import { useMemo } from 'react';
import {
  useAllOrganizationsLazyQuery,
  useAssignOrganizationAsCommunityLeadMutation,
  useAssignOrganizationAsCommunityMemberMutation,
  useAssignUserAsCommunityLeadMutation,
  useAssignUserAsCommunityMemberMutation,
  useAssignUserAsSpaceAdminMutation,
  useEventOnApplicationMutation,
  useSpaceApplicationsInvitationsQuery,
  useSpaceAvailableMemberUsersLazyQuery,
  useSpaceCommunityMembersQuery,
  useRemoveOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityMemberMutation,
  useRemoveUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityMemberMutation,
  useRemoveUserAsSpaceAdminMutation,
  useUsersWithCredentialsQuery,
  useInvitationStateEventMutation,
  useSpaceDisplayNameQuery,
  useDeleteInvitationMutation,
  useDeleteExternalInvitationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential, AuthorizationPrivilege } from '../../../../../core/apollo/generated/graphql-schema';
import { OrganizationDetailsFragmentWithRoles } from '../../../../community/community/CommunityAdmin/CommunityOrganizations';
import { CommunityMemberUserFragmentWithRoles } from '../../../../community/community/CommunityAdmin/CommunityUsers';
import useInviteUsers from '../../../../community/invitations/useInviteUsers';

const MAX_AVAILABLE_MEMBERS = 100;
const buildUserFilterObject = (filter: string | undefined) =>
  filter
    ? {
        firstName: filter,
        lastName: filter,
        email: filter,
      }
    : undefined;

const buildOrganizationFilterObject = (filter: string | undefined) =>
  filter
    ? {
        displayName: filter,
      }
    : undefined;

const useSpaceCommunityContext = (spaceId: string) => {
  if (!spaceId) {
    throw new Error('Must be within a Space route.');
  }

  const {
    data,
    loading: loadingMembers,
    refetch: refetchCommunityMembers,
  } = useSpaceCommunityMembersQuery({
    variables: {
      spaceId,
    },
  });

  const communityId = data?.space.community?.id;
  const communityPolicy = data?.space.community?.policy;

  const permissions = {
    canAddMembers: (data?.space.community?.authorization?.myPrivileges ?? []).some(
      priv => priv === AuthorizationPrivilege.CommunityAddMember
    ),
  };

  const { data: spaceDisplayNameData } = useSpaceDisplayNameQuery({
    variables: {
      spaceId,
    },
  });

  const spaceDisplayName = spaceDisplayNameData?.space.profile.displayName;

  const {
    data: dataAdmins,
    loading: loadingAdmins,
    refetch: refetchAuthorization,
  } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.SpaceAdmin,
        resourceID: spaceId,
      },
    },
  });

  const {
    data: dataApplications,
    loading: loadingApplications,
    refetch: refetchApplicationsAndInvitations,
  } = useSpaceApplicationsInvitationsQuery({
    variables: { spaceId },
  });

  // Members:
  const users = useMemo(() => {
    const members = data?.space.community?.memberUsers ?? [];
    const leads = data?.space.community?.leadUsers ?? [];
    const admins = dataAdmins?.usersWithAuthorizationCredential ?? [];

    const result = members.map<CommunityMemberUserFragmentWithRoles>(user => ({
      ...user,
      isMember: true,
      isLead: leads.find(lead => lead.id === user.id) !== undefined,
      isAdmin: admins.find(admins => admins.id === user.id) !== undefined,
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
        });
      }
    });

    return result;
  }, [data, dataAdmins]);

  const organizations = useMemo(() => {
    const members = data?.space.community?.memberOrganizations ?? [];
    const leads = data?.space.community?.leadOrganizations ?? [];

    const result = members.map<OrganizationDetailsFragmentWithRoles>(member => ({
      ...member,
      isMember: true,
      isLead: leads.find(lead => lead.id === member.id) !== undefined,
      isFacilitating: data?.space.host?.id === member.id,
    }));

    // Push the rest of the leads that are not yet in the list of members
    leads.forEach(lead => {
      const member = result.find(organization => organization.id === lead.id);
      if (!member) {
        result.push({
          ...lead,
          isMember: false,
          isLead: true,
          isFacilitating: data?.space.host?.id === lead.id,
        });
      }
    });

    // Add Facilitating if it's not yet in the result
    if (data?.space.host) {
      const member = result.find(organization => organization.id === data.space.host!.id);
      if (!member) {
        result.push({ ...data.space.host, isMember: false, isLead: false, isFacilitating: true });
      }
    }
    return result;
  }, [data, dataAdmins]);

  // Available new members:
  const [fetchAvailableUsers, { refetch: refetchAvailableMemberUsers }] = useSpaceAvailableMemberUsersLazyQuery();
  const getAvailableUsers = async (filter: string | undefined) => {
    const { data } = await fetchAvailableUsers({
      variables: {
        spaceId,
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildUserFilterObject(filter),
      },
    });
    return data?.space.community?.availableMemberUsers?.users;
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
  const [addUserToCommunity] = useAssignUserAsCommunityMemberMutation();
  const handleAddUser = async (memberId: string) => {
    if (!communityId) {
      return;
    }
    await addUserToCommunity({
      variables: {
        communityId,
        memberId,
      },
    });
    await refetchAvailableMemberUsers();
    return refetchCommunityMembers();
  };

  const [addOrganizationToCommunity] = useAssignOrganizationAsCommunityMemberMutation();
  const handleAddOrganization = async (memberId: string) => {
    if (!communityId) {
      return;
    }
    await addOrganizationToCommunity({
      variables: {
        communityId,
        memberId,
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

  const [assignUserAsCommunityLead] = useAssignUserAsCommunityLeadMutation();
  const [removeUserAsCommunityLead] = useRemoveUserAsCommunityLeadMutation();
  const handleUserLeadChange = async (memberId: string, isLead: boolean) => {
    if (!communityId) {
      return;
    }
    if (isLead) {
      await assignUserAsCommunityLead({
        variables: {
          memberId,
          communityId,
        },
      });
    } else {
      await removeUserAsCommunityLead({
        variables: {
          memberId,
          communityId,
        },
      });
    }
    return refetchCommunityMembers();
  };

  const [assignUserAsSpaceAdmin] = useAssignUserAsSpaceAdminMutation();
  const [removeUserAsSpaceAdmin] = useRemoveUserAsSpaceAdminMutation();
  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await assignUserAsSpaceAdmin({
        variables: {
          input: {
            userID: memberId,
            spaceID: spaceId,
          },
        },
      });
    } else {
      await removeUserAsSpaceAdmin({
        variables: {
          input: {
            userID: memberId,
            spaceID: spaceId,
          },
        },
      });
    }
    return refetchAuthorization();
  };

  const [removeUserAsCommunityMember] = useRemoveUserAsCommunityMemberMutation();
  const handleRemoveUser = async (memberId: string) => {
    if (!communityId) {
      return;
    }
    await removeUserAsCommunityMember({
      variables: {
        memberId,
        communityId,
      },
    });
    return refetchCommunityMembers();
  };

  const [assignOrganizationAsCommunityLead] = useAssignOrganizationAsCommunityLeadMutation();
  const [removeOrganizationAsCommunityLeadMutation] = useRemoveOrganizationAsCommunityLeadMutation();
  const onOrganizationLeadChange = async (memberId: string, isLead: boolean) => {
    if (!communityId) {
      return;
    }
    if (isLead) {
      await assignOrganizationAsCommunityLead({
        variables: {
          memberId,
          communityId,
        },
      });
    } else {
      await removeOrganizationAsCommunityLeadMutation({
        variables: {
          memberId,
          communityId,
        },
      });
    }
    return refetchCommunityMembers();
  };

  const [removeOrganizationAsCommunityMember] = useRemoveOrganizationAsCommunityMemberMutation();
  const handleRemoveOrganization = async (memberId: string) => {
    if (!communityId) {
      return;
    }
    await removeOrganizationAsCommunityMember({
      variables: {
        memberId,
        communityId,
      },
    });
    return refetchCommunityMembers();
  };

  const onInviteUser = async () => {
    await refetchApplicationsAndInvitations();
  };

  const { inviteExistingUser, inviteExternalUser } = useInviteUsers(communityId, {
    onInviteExistingUser: onInviteUser,
    onInviteExternalUser: onInviteUser,
  });

  const [sendInvitationStateEvent] = useInvitationStateEventMutation();

  const [deleteInvitation] = useDeleteInvitationMutation();
  const [deleteExternalInvitation] = useDeleteExternalInvitationMutation();

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
  const handleDeleteInvitationExternal = async (invitationId: string) => {
    await deleteExternalInvitation({
      variables: {
        invitationId,
      },
    });
    await refetchApplicationsAndInvitations();
  };

  return {
    users,
    organizations,
    communityPolicy,
    permissions,
    spaceDisplayName,
    applications: dataApplications?.space.community?.applications,
    invitations: dataApplications?.space.community?.invitations,
    invitationsExternal: dataApplications?.space.community?.invitationsExternal,
    onApplicationStateChange: handleApplicationStateChange,
    onInvitationStateChange: handleInvitationStateChange,
    onUserLeadChange: handleUserLeadChange,
    onUserAuthorizationChange: handleUserAuthorizationChange,
    onOrganizationLeadChange: onOrganizationLeadChange,
    onAddUser: handleAddUser,
    onAddOrganization: handleAddOrganization,
    onRemoveUser: handleRemoveUser,
    onRemoveOrganization: handleRemoveOrganization,
    onDeleteInvitation: handleDeleteInvitation,
    onDeleteInvitationExternal: handleDeleteInvitationExternal,
    getAvailableUsers,
    getAvailableOrganizations,
    inviteExistingUser,
    inviteExternalUser,
    loading: loadingAdmins || loadingMembers || loadingApplications,
  };
};

export default useSpaceCommunityContext;
