import { useMemo } from 'react';
import {
  useAllOrganizationsLazyQuery,
  useAssignOrganizationAsCommunityLeadMutation,
  useAssignOrganizationAsCommunityMemberMutation,
  useAssignUserAsCommunityLeadMutation,
  useAssignUserAsCommunityMemberMutation,
  useEventOnApplicationMutation,
  useCommunityApplicationsInvitationsQuery,
  useRemoveOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityMemberMutation,
  useRemoveUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityMemberMutation,
  useUsersWithCredentialsQuery,
  useInvitationStateEventMutation,
  useDeleteInvitationMutation,
  useDeletePlatformInvitationMutation,
  useCommunityMembersListQuery,
  useCommunityAvailableMembersLazyQuery,
  useAssignCommunityRoleToUserMutation,
  useRemoveCommunityRoleFromUserMutation,
  useAvailableVirtualContributorsLazyQuery,
  useRemoveVirtualContributorFromCommunityMutation,
  useAvailableVirtualContributorsInLibraryLazyQuery,
  useAssignCommunityRoleToVirtualContributorMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationCredential,
  AuthorizationPrivilege,
  CommunityRole,
  SearchVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import { OrganizationDetailsFragmentWithRoles } from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import { CommunityMemberUserFragmentWithRoles } from '../../../community/community/CommunityAdmin/CommunityUsers';
import useInviteUsers from '../../../community/invitations/useInviteUsers';
import { getJourneyTypeName } from '../../../journey/JourneyTypeName';
import { JourneyLevel } from '../../../../main/routing/resolvers/RouteResolver';
import { Identifiable } from '../../../../core/utils/Identifiable';

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
interface useCommunityAdminParams {
  communityId: string;
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
  journeyLevel: JourneyLevel | -1;
}

interface VirtualContributorNameProps extends Identifiable {
  profile: {
    id: string;
    displayName: string;
  };
}

const useCommunityAdmin = ({
  communityId,
  spaceId,
  challengeId,
  opportunityId,
  journeyLevel,
}: useCommunityAdminParams) => {
  const journeyTypeName = getJourneyTypeName({
    spaceNameId: spaceId,
    challengeNameId: challengeId,
    opportunityNameId: opportunityId,
  })!;

  const {
    data,
    loading: loadingMembers,
    refetch: refetchCommunityMembers,
  } = useCommunityMembersListQuery({
    variables: {
      communityId,
      spaceId,
      includeSpaceHost: journeyTypeName === 'space',
    },
    skip: !communityId || !spaceId,
  });

  const communityPolicy = data?.lookup.community?.policy;

  const permissions = {
    virtualContributorsEnabled: (data?.lookup.community?.authorization?.myPrivileges ?? []).some(
      priv => priv === AuthorizationPrivilege.AccessVirtualContributor
    ),
    canAddMembers: (data?.lookup.community?.authorization?.myPrivileges ?? []).some(
      priv => priv === AuthorizationPrivilege.CommunityAddMember
    ),
    // the following privilege allows Admins of a space without CommunityAddMember privilege, to
    // be able to add VC from the account; CommunityAddMember overrides this privilege as it's not granted to PAs
    canAddVirtualContributorsFromAccount: (data?.lookup.community?.authorization?.myPrivileges ?? []).some(
      priv => priv === AuthorizationPrivilege.CommunityAddMemberVcFromAccount
    ),
  };

  const {
    data: dataAdmins,
    loading: loadingAdmins,
    refetch: refetchAuthorization,
  } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.SpaceAdmin,
        resourceID: [spaceId, challengeId, opportunityId][journeyLevel],
      },
    },
    skip: ![spaceId, challengeId, opportunityId][journeyLevel],
  });

  const {
    data: dataApplications,
    loading: loadingApplications,
    refetch: refetchApplicationsAndInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    variables: { communityId },
    skip: !communityId,
  });

  // Members:
  const users = useMemo(() => {
    const members = data?.lookup.community?.memberUsers ?? [];
    const leads = data?.lookup.community?.leadUsers ?? [];
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
    const members = data?.lookup.community?.memberOrganizations ?? [];
    const leads = data?.lookup.community?.leadOrganizations ?? [];

    const result = members.map<OrganizationDetailsFragmentWithRoles>(member => ({
      ...member,
      isMember: true,
      isLead: leads.find(lead => lead.id === member.id) !== undefined,
      isFacilitating: data?.lookup.space?.provider.id === member.id,
    }));

    // Push the rest of the leads that are not yet in the list of members
    leads.forEach(lead => {
      const member = result.find(organization => organization.id === lead.id);
      if (!member) {
        result.push({
          ...lead,
          isMember: false,
          isLead: true,
          isFacilitating: data?.lookup.space?.provider.id === lead.id,
        });
      }
    });

    // Add Facilitating if it's not yet in the result
    if (data?.lookup.space?.provider) {
      const member = result.find(organization => organization.id === data.lookup.space?.provider?.id);
      if (!member) {
        result.push({ ...data.lookup.space.provider, isMember: false, isLead: false, isFacilitating: true });
      }
    }
    return result;
  }, [data, dataAdmins]);

  const virtualContributors = useMemo(() => {
    return data?.lookup.community?.virtualContributorsInRole ?? [];
  }, [data]);

  // Available new members:
  const [fetchAvailableUsers, { refetch: refetchAvailableMemberUsers }] = useCommunityAvailableMembersLazyQuery();
  const getAvailableUsers = async (filter: string | undefined) => {
    const { data } = await fetchAvailableUsers({
      variables: {
        communityId,
        first: MAX_AVAILABLE_MEMBERS,
        filter: buildUserFilterObject(filter),
      },
    });
    return data?.lookup.availableMembers?.availableMemberUsers?.users;
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

  const filterByName = (vc: VirtualContributorNameProps, filter?: string) =>
    vc.profile.displayName.toLowerCase().includes(filter?.toLowerCase() ?? '');

  const filterExisting = (vc: VirtualContributorNameProps, existingVCs) =>
    !existingVCs.some(member => member.id === vc.id);

  const [fetchAllVirtualContributorsInLibrary] = useAvailableVirtualContributorsInLibraryLazyQuery();
  const getAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    const { data } = await fetchAllVirtualContributorsInLibrary();

    return (data?.platform.library.virtualContributors ?? []).filter(
      vc =>
        vc.searchVisibility === SearchVisibility.Public &&
        filterExisting(vc, virtualContributors) &&
        filterByName(vc, filter)
    );
  };

  const [fetchAllVirtualContributors] = useAvailableVirtualContributorsLazyQuery();
  const getAvailableVirtualContributors = async (filter: string | undefined, all: boolean = false) => {
    const { data } = await fetchAllVirtualContributors({
      variables: {
        filterSpace: !all || journeyLevel > 0,
        filterSpaceId: spaceId,
      },
    });

    // Results for Space Level - on Account if !all (filter in the query)
    if (journeyLevel === 0) {
      return (data?.lookup?.space?.account.virtualContributors ?? data?.virtualContributors ?? []).filter(
        vc => filterExisting(vc, virtualContributors) && filterByName(vc, filter)
      );
    }

    // Results for Subspaces - Community Members including External VCs (filter in the query)
    if (all) {
      return (data?.lookup?.space?.community.virtualContributorsInRole ?? []).filter(
        vc => filterExisting(vc, virtualContributors) && filterByName(vc, filter)
      );
    }

    // Results for Subspaces - Only Community Members On Account (filter in the query)
    return (data?.lookup?.space?.community.virtualContributorsInRole ?? []).filter(
      vc =>
        data?.lookup?.space?.account.virtualContributors.some(member => member.id === vc.id) &&
        filterExisting(vc, virtualContributors) &&
        filterByName(vc, filter)
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

  const [assignCommunityRole] = useAssignCommunityRoleToUserMutation();
  const [removeCommunityRole] = useRemoveCommunityRoleFromUserMutation();
  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await assignCommunityRole({
        variables: { communityID: communityId, role: CommunityRole.Admin, userID: memberId },
      });
    } else {
      await removeCommunityRole({
        variables: { communityID: communityId, role: CommunityRole.Admin, userID: memberId },
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

  const [addVirtualContributor] = useAssignCommunityRoleToVirtualContributorMutation();
  const handleAddVirtualContributor = async (virtualContributorId: string) => {
    if (!communityId) {
      return;
    }
    await addVirtualContributor({
      variables: {
        communityId,
        virtualContributorId,
      },
    });
    return refetchCommunityMembers();
  };
  const [removeVirtualContributor] = useRemoveVirtualContributorFromCommunityMutation();
  const handleRemoveVirtualContributor = async (virtualContributorId: string) => {
    if (!communityId) {
      return;
    }
    await removeVirtualContributor({
      variables: {
        communityId,
        virtualContributorId,
      },
    });
    return refetchCommunityMembers();
  };

  const onInviteUser = async () => {
    await refetchApplicationsAndInvitations();
  };

  const { inviteContributor: inviteExistingUser, platformInviteToCommunity: inviteExternalUser } = useInviteUsers(
    communityId,
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

  return {
    users,
    organizations,
    virtualContributors,
    communityPolicy,
    permissions,
    applications: dataApplications?.lookup.community?.applications,
    invitations: dataApplications?.lookup.community?.invitations,
    platformInvitations: dataApplications?.lookup.community?.platformInvitations,
    onApplicationStateChange: handleApplicationStateChange,
    onInvitationStateChange: handleInvitationStateChange,
    onUserLeadChange: handleUserLeadChange,
    onUserAuthorizationChange: handleUserAuthorizationChange,
    onOrganizationLeadChange: onOrganizationLeadChange,
    onAddUser: handleAddUser,
    onAddOrganization: handleAddOrganization,
    onAddVirtualContributor: handleAddVirtualContributor,
    onRemoveUser: handleRemoveUser,
    onRemoveOrganization: handleRemoveOrganization,
    onRemoveVirtualContributor: handleRemoveVirtualContributor,
    onDeleteInvitation: handleDeleteInvitation,
    onDeletePlatformInvitation: handleDeletePlatformInvitation,
    getAvailableUsers,
    getAvailableOrganizations,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    inviteExternalUser,
    loading: loadingAdmins || loadingMembers || loadingApplications,
  };
};

export default useCommunityAdmin;
