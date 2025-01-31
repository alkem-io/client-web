import { useMemo } from 'react';
import { useCommunityProviderDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  RoleName,
  RoleSetMemberOrganizationFragment,
  RoleSetMemberUserFragment,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import useInviteContributors from '../../../access/_removeMe/useInviteContributors';
import useRoleSetAdmin, { RELEVANT_ROLES } from '@/domain/access/RoleSetAdmin/useRoleSetAdmin';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';
import useRoleSetApplicationsAndInvitations, {
  InviteContributorsData,
  InviteExternalUserData,
} from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';

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

  const {
    users,
    organizations,
    virtualContributors,
    rolesDefinitions,
    assignRoleToUser,
    removeRoleFromUser,
    assignRoleToOrganization,
    removeRoleFromOrganization,
    loading,
  } = useRoleSetAdmin({
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
  const { findAvailableUsersForRoleSetEntryRole, findAvailableOrganizationsForRoleSet } =
    useRoleSetAvailableContributors({
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
  const handleAddUser = (memberId: string) => assignRoleToUser(memberId, RoleName.Member);
  const handleRemoveUser = async (memberId: string) => removeRoleFromUser(memberId, RoleName.Member);

  const handleUserLeadChange = (memberId: string, isLead: boolean) =>
    isLead ? assignRoleToUser(memberId, RoleName.Lead) : removeRoleFromUser(memberId, RoleName.Lead);

  const handleRemoveOrganization = async (memberId: string) => removeRoleFromOrganization(memberId, RoleName.Member);

  const handleUserAuthorizationChange = async (memberId: string, isAdmin: boolean) =>
    isAdmin ? assignRoleToUser(memberId, RoleName.Admin) : removeRoleFromUser(memberId, RoleName.Admin);

  const handleAddOrganization = async (memberId: string) => assignRoleToOrganization(memberId, RoleName.Member);

  const onOrganizationLeadChange = async (memberId: string, isLead: boolean) =>
    isLead ? assignRoleToOrganization(memberId, RoleName.Lead) : removeRoleFromOrganization(memberId, RoleName.Lead);

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
