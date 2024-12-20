import { useMemo } from 'react';
import {
  useAssignRoleToVirtualContributorMutation,
  useAvailableVirtualContributorsLazyQuery,
  useAvailableVirtualContributorsInLibraryLazyQuery,
  useBodyOfKnowledgeProfileLazyQuery,
  useCommunityVirtualMembersListQuery,
  useRemoveRoleFromVirtualContributorMutation,
  refetchSpaceCommunityPageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityRoleType,
  SearchVisibility,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
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
    canAddMembers: roleSetMyPrivileges.some(priv => priv === AuthorizationPrivilege.CommunityAddMember),
    // the following privilege allows Admins of a space without CommunityAddMember privilege, to
    // be able to add VC from the account; CommunityAddMember overrides this privilege as it's not granted to PAs
    canAddVirtualContributorsFromAccount: roleSetMyPrivileges.some(
      priv => priv === AuthorizationPrivilege.CommunityAddMemberVcFromAccount
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

  // Filter functions for virtual contributors
  const filterByName = (vc: VirtualContributorNameProps, filter?: string) =>
    vc.profile.displayName.toLowerCase().includes(filter?.toLowerCase() ?? '');
  const filterExisting = (vc: VirtualContributorNameProps, existingVCs) =>
    !existingVCs.some(member => member.id === vc.id);

  // TODO: need pagination in the future
  const [fetchAllVirtualContributorsInLibrary, { loading: libraryVCsLoading }] =
    useAvailableVirtualContributorsInLibraryLazyQuery();
  const getAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    const { data } = await fetchAllVirtualContributorsInLibrary();

    return (data?.platform.library.virtualContributors ?? []).filter(
      vc =>
        vc.searchVisibility === SearchVisibility.Public &&
        filterExisting(vc, virtualContributors) &&
        filterByName(vc, filter)
    );
  };

  const [fetchAllVirtualContributors, { loading: accountVCsLoading }] = useAvailableVirtualContributorsLazyQuery();
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
  const onAddVirtualContributor = async (virtualContributorId: string) => {
    if (!roleSetId) {
      return;
    }
    await addVirtualContributor({
      variables: {
        roleSetId,
        contributorId: virtualContributorId,
        role: CommunityRoleType.Member,
      },
      refetchQueries: [refetchSpaceCommunityPageQuery({ spaceNameId: spaceId ?? '', includeCommunity: true })],
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
        role: CommunityRoleType.Member,
      },
    });

    return refetchCommunityVirtualMembers();
  };

  const { inviteContributor: inviteExistingUser, platformInviteToCommunity: inviteExternalUser } =
    useInviteUsers(roleSetId);

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
    accountVCsLoading,
    libraryVCsLoading,
  };
};

export default useInviteContributors;
