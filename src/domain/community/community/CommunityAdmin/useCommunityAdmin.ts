import { useMemo } from 'react';
import {
  RoleName,
  RoleSetContributorType,
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
import { useSpaceCommunityPageQuery } from '@/core/apollo/generated/apollo-hooks';

interface useCommunityAdminParams {
  roleSetId: string;
  spaceId?: string;
  spaceLevel?: SpaceLevel;
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
  const { data: communityProviderData, loading: loadingCommunityProvider } = useSpaceCommunityPageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel !== SpaceLevel.L0,
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

  const communityProvider = communityProviderData?.lookup.space?.about.provider;
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
    onDeleteInvitation: deleteInvitation,
    onDeletePlatformInvitation: deletePlatformInvitation,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onAddVirtualContributor,
    onRemoveUser,
    onRemoveOrganization,
    onRemoveVirtualContributor,
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
