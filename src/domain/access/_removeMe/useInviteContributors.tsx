import { useMemo } from 'react';
import {
  useAssignRoleToVirtualContributorMutation,
  useCommunityVirtualMembersListQuery,
  useRemoveRoleFromVirtualContributorMutation,
  refetchSpaceCommunityPageQuery,
  useSpaceBodyOfKnowledgeAboutLazyQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';

interface useInviteContributorsParams {
  roleSetId: string;
  spaceId?: string;
  spaceLevel: SpaceLevel | undefined;
}

/**
 * @deprecated Use rolesetManager for this
 */
const useInviteContributors = ({ roleSetId, spaceId, spaceLevel }: useInviteContributorsParams) => {
  // Fetch community virtual members list
  const {
    data: roleSetData,
    loading: loadingMembers,
    refetch: refetchCommunityVirtualMembers,
  } = useCommunityVirtualMembersListQuery({
    variables: {
      roleSetId,
    },
    skip: !roleSetId || !spaceId,
  });

  // Determine the permissions based on the user's privileges
  const roleSetMyPrivileges = roleSetData?.lookup.roleSet?.authorization?.myPrivileges ?? [];
  const permissions = {
    canAddMembers: roleSetMyPrivileges.some(priv => priv === AuthorizationPrivilege.RolesetEntryRoleAssign),
    // the following privilege allows Admins of a space without CommunityAddMember privilege, to
    // be able to add VC from the account; CommunityAddMember overrides this privilege as it's not granted to PAs
    canAddVirtualContributorsFromAccount: roleSetMyPrivileges.some(
      priv => priv === AuthorizationPrivilege.CommunityAssignVcFromAccount
    ),
  };

  const [getVcSpaceBoKAuth, { loading: bokProfileAuthLoading }] =
    useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery();
  const [getVcBoKProfile, { loading: bokProfileLoading }] = useSpaceBodyOfKnowledgeAboutLazyQuery();
  const getBoKProfile = async (bodyOfKnowledgeID: string) => {
    const { data: authData } = await getVcSpaceBoKAuth({
      variables: {
        spaceId: bodyOfKnowledgeID!,
      },
    });

    if (!authData?.lookup.myPrivileges?.space?.includes(AuthorizationPrivilege.ReadAbout)) {
      return;
    }

    const { data } = await getVcBoKProfile({
      variables: {
        spaceId: bodyOfKnowledgeID!,
      },
    });

    return data?.lookup?.space?.about.profile;
  };

  // Memoize the virtual contributors list (already members)
  const virtualContributors = useMemo(
    () => roleSetData?.lookup.roleSet?.memberVirtualContributors ?? [],
    [roleSetData]
  );

  const {
    findAvailableVirtualContributorsForRoleSet,
    findAvailableVirtualContributorsInLibrary,
    loading: availableVCsLoading,
  } = useRoleSetAvailableContributors({
    roleSetId,
    filterCurrentMembers: virtualContributors,
  });

  const getAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    const { virtualContributors } = await findAvailableVirtualContributorsInLibrary(filter);
    return virtualContributors;
  };
  const getAvailableVirtualContributors = async (filter?: string, all: boolean = false) => {
    const { virtualContributors } = await findAvailableVirtualContributorsForRoleSet(spaceLevel, spaceId, all, filter);
    return virtualContributors;
  };

  const [addVirtualContributor] = useAssignRoleToVirtualContributorMutation();
  const onAddVirtualContributor = async (virtualContributorId: string) => {
    if (!roleSetId) {
      return;
    }
    await addVirtualContributor({
      variables: {
        roleSetId,
        contributorId: virtualContributorId,
        role: RoleName.Member,
      },
      refetchQueries: [refetchSpaceCommunityPageQuery({ spaceId: spaceId! })],
    });

    return refetchCommunityVirtualMembers();
  };

  const [removeVirtualContributor] = useRemoveRoleFromVirtualContributorMutation();
  const onRemoveVirtualContributor = async (virtualContributorId: string) => {
    if (!roleSetId) {
      return;
    }
    await removeVirtualContributor({
      variables: {
        roleSetId,
        contributorId: virtualContributorId,
        role: RoleName.Member,
      },
    });

    return refetchCommunityVirtualMembers();
  };

  const { inviteContributorOnRoleSet: inviteExistingUser, inviteContributorOnPlatformRoleSet: inviteExternalUser } =
    useRoleSetApplicationsAndInvitations({});

  return {
    permissions,
    virtualContributors,
    onAddVirtualContributor,
    onRemoveVirtualContributor,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    inviteExternalUser,
    getBoKProfile,
    loadingMembers,
    bokProfileLoading: bokProfileAuthLoading || bokProfileLoading,
    availableVCsLoading,
  };
};

export default useInviteContributors;
