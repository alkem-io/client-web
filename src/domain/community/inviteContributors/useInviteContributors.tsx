import { useMemo } from 'react';
import {
  useCommunityMembersListQuery,
  useAssignRoleToVirtualContributorMutation,
  useAvailableVirtualContributorsLazyQuery,
  useAvailableVirtualContributorsInLibraryLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { CommunityRoleType, SearchVisibility, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useInviteUsers from '@/domain/community/invitations/useInviteUsers';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import { Identifiable } from '@/core/utils/Identifiable';

// TODO: Inherit from CoreEntityIds when they are not NameIds
interface useInviteContributorsParams {
  roleSetId: string;
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
  spaceLevel: SpaceLevel | undefined;
}

interface VirtualContributorNameProps extends Identifiable {
  profile: {
    id: string;
    displayName: string;
  };
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

  const virtualContributors = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;
    return roleSet?.memberVirtualContributors ?? [];
  }, [roleSetData]);

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
        filterSpace: !all || spaceLevel !== SpaceLevel.Space,
        filterSpaceId: spaceId,
      },
    });
    const roleSet = data?.lookup?.space?.community?.roleSet;

    // Results for Space Level - on Account if !all (filter in the query)
    if (spaceLevel === SpaceLevel.Space) {
      return (data?.lookup?.space?.account.virtualContributors ?? data?.virtualContributors ?? []).filter(
        vc => filterExisting(vc, virtualContributors) && filterByName(vc, filter)
      );
    }

    // Results for Subspaces - Community Members including External VCs (filter in the query)
    if (all) {
      return (roleSet?.virtualContributorsInRole ?? []).filter(
        vc => filterExisting(vc, virtualContributors) && filterByName(vc, filter)
      );
    }

    // Results for Subspaces - Only Community Members On Account (filter in the query)
    return (roleSet?.virtualContributorsInRole ?? []).filter(
      vc =>
        data?.lookup?.space?.account.virtualContributors.some(member => member.id === vc.id) &&
        filterExisting(vc, virtualContributors) &&
        filterByName(vc, filter)
    );
  };

  const [addVirtualContributor] = useAssignRoleToVirtualContributorMutation();
  const handleAddVirtualContributor = async (virtualContributorId: string) => {
    if (!roleSetId) {
      return;
    }
    await addVirtualContributor({
      variables: {
        roleSetId,
        contributorId: virtualContributorId,
        role: CommunityRoleType.Member,
      },
    });
    return refetchCommunityMembers();
  };

  const { inviteContributor: inviteExistingUser, platformInviteToCommunity: inviteExternalUser } =
    useInviteUsers(roleSetId);

  return {
    virtualContributors,
    onAddVirtualContributor: handleAddVirtualContributor,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    inviteExternalUser,
    loading: loadingMembers,
  };
};

export default useInviteContributors;
