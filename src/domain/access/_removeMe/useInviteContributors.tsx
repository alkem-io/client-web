import { useMemo } from 'react';
import {
  useAssignRoleToVirtualContributorMutation,
  useBodyOfKnowledgeProfileLazyQuery,
  useCommunityVirtualMembersListQuery,
  useRemoveRoleFromVirtualContributorMutation,
  refetchSpaceCommunityPageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';

// TODO: Inherit from CoreEntityIds when they are not NameIds
interface useInviteContributorsParams {
  roleSetId: string;
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
  spaceLevel: SpaceLevel | undefined;
}

const useInviteContributors = ({
  roleSetId,
  spaceId,
  challengeId,
  opportunityId,
  spaceLevel,
}: useInviteContributorsParams) => {
  const journeyTypeName = getJourneyTypeName({
    spaceNameId: spaceId,
    challengeNameId: challengeId,
    opportunityNameId: opportunityId,
  })!;

  // Fetch community virtual members list
  const {
    data: roleSetData,
    loading: loadingMembers,
    refetch: refetchCommunityVirtualMembers,
  } = useCommunityVirtualMembersListQuery({
    variables: {
      roleSetId,
      spaceId,
      includeSpaceHost: journeyTypeName === 'space',
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

  const [getVcBoKProfile, { loading: bokProfileLoading }] = useBodyOfKnowledgeProfileLazyQuery();
  const getBoKProfile = async (bodyOfKnowledgeID: string) => {
    const { data } = await getVcBoKProfile({
      variables: {
        spaceId: bodyOfKnowledgeID!,
      },
    });

    return data?.lookup?.space?.profile;
  };

  // Memoize the virtual contributors list (already members)
  const virtualContributors = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;
    return roleSet?.memberVirtualContributors ?? [];
  }, [roleSetData]);

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
      refetchQueries: [refetchSpaceCommunityPageQuery({ spaceId: spaceId!, includeCommunity: true })],
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
    bokProfileLoading,
    availableVCsLoading,
  };
};

export default useInviteContributors;
