import { useMemo } from 'react';
import {
  useAssignOrganizationAsCommunityLeadMutation,
  useAssignUserAsCommunityLeadMutation,
  useAssignUserAsHubAdminMutation,
  useEventOnApplicationMutation,
  useHubApplicationsQuery,
  useHubCommunityMembersQuery,
  useRemoveOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityMemberMutation,
  useRemoveUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityMemberMutation,
  useRemoveUserAsHubAdminMutation,
  useUsersWithCredentialsQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';
import { OrganizationDetailsFragmentWithRoles } from '../../../../community/community/CommunityAdmin/CommunityOrganizations';
import { CommunityMemberUserFragmentWithRoles } from '../../../../community/community/CommunityAdmin/CommunityUsers';

const useHubCommunityContext = (hubId: string) => {
  if (!hubId) {
    throw new Error('Must be within a Hub route.');
  }

  const {
    data,
    loading: loadingMembers,
    refetch: refetchCommunityMembers,
  } = useHubCommunityMembersQuery({
    variables: {
      hubId,
    },
  });

  const communityId = data?.hub.community?.id;

  const {
    data: dataAdmins,
    loading: loadingAdmins,
    refetch: refetchAuthorization,
  } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: AuthorizationCredential.HubAdmin,
        resourceID: hubId,
      },
    },
  });

  const { data: dataApplications, loading: loadingApplications } = useHubApplicationsQuery({
    variables: { hubId },
  });

  // Members:
  const users = useMemo(() => {
    const result = (data?.hub.community?.memberUsers ?? []).map<CommunityMemberUserFragmentWithRoles>(user => ({
      ...user,
      isMember: true,
      isLead: false,
      isAdmin: false,
    }));

    // Add Leads
    (data?.hub.community?.leadUsers ?? []).forEach(lead => {
      const member = result.find(user => user.id === lead.id);
      if (member) {
        // If already a member set the lead role
        member.isLead = true;
      } else {
        // If not, add the entire user to the list
        result.push({ ...lead, isMember: false, isLead: true, isAdmin: false });
      }
    });

    // Add Admins:
    (dataAdmins?.usersWithAuthorizationCredential ?? []).forEach(admin => {
      const member = result.find(user => user.id === admin.id);
      if (member) {
        // If already a member set the admin role
        member.isAdmin = true;
      } else {
        // If not, add the entire user to the list
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
    // Members:
    const result = (data?.hub.community?.memberOrganizations ?? []).map<OrganizationDetailsFragmentWithRoles>(
      organization => ({
        ...organization,
        isMember: true,
        isLead: false,
        isFaicilitating: false,
      })
    );

    // Add Leads
    (data?.hub.community?.leadOrganizations ?? []).forEach(lead => {
      const member = result.find(organization => organization.id === lead.id);
      if (member) {
        // If already a member set the lead role
        member.isLead = true;
      } else {
        // If not, add the entire organization to the list
        result.push({ ...lead, isMember: false, isLead: true, isFaicilitating: false });
      }
    });

    // Add Facilitating:
    if (data?.hub.host) {
      const member = result.find(organization => organization.id === data.hub.host!.id);
      if (member) {
        // If already a member set the lead role
        member.isFaicilitating = true;
      } else {
        // If not, add the entire organization to the list
        result.push({ ...data.hub.host, isMember: false, isLead: false, isFaicilitating: true });
      }
    }
    return result;
  }, [data, dataAdmins]);

  // Mutations:
  const [updateApplication] = useEventOnApplicationMutation({});
  const handleApplicationStateChange = (applicationId: string, newState: string) => {
    return updateApplication({
      variables: {
        input: {
          applicationID: applicationId,
          eventName: newState,
        },
      },
    });
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

  const [assignUserAsHubAdmin] = useAssignUserAsHubAdminMutation();
  const [removeUserAsHubAdmin] = useRemoveUserAsHubAdminMutation();
  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await assignUserAsHubAdmin({
        variables: {
          input: {
            userID: memberId,
            hubID: hubId,
          },
        },
      });
    } else {
      await removeUserAsHubAdmin({
        variables: {
          input: {
            userID: memberId,
            hubID: hubId,
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

  return {
    users,
    organizations,
    applications: dataApplications?.hub.community?.applications,
    onApplicationStateChange: handleApplicationStateChange,
    onUserLeadChange: handleUserLeadChange,
    onUserAuthorizationChange: handleUserAuthorizationChange,
    onOrganizationLeadChange: onOrganizationLeadChange,
    onRemoveUser: handleRemoveUser,
    onRemoveOrganization: handleRemoveOrganization,
    loading: loadingAdmins || loadingMembers || loadingApplications,
  };
};

export default useHubCommunityContext;
