import { AiPersonaEngine, SearchVisibility, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import {
  useAvailableVirtualContributorsInLibraryLazyQuery,
  useAvailableVirtualContributorsInSpaceAccountLazyQuery,
  useAvailableVirtualContributorsInSpaceL0LazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';

interface useVirtualContributorsAdminParams {
  level: SpaceLevel;
  spaceL0Id: string;
  currentMembers: Identifiable[];
}

export interface ContributorNameProps extends Identifiable {
  profile: {
    displayName: string;
  };
}

export interface useVirtualContributorsAdminProvided {
  virtualContributorAdmin: {
    getAvailable: (filter?: string) => Promise<
      {
        id: string;
        profile: {
          displayName: string;
          url: string;
        };
        aiPersona?: {
          engine: AiPersonaEngine;
        };
      }[]
    >;
    getAvailableInLibrary: (filter: string | undefined) => Promise<
      {
        id: string;
        profile: {
          displayName: string;
          url: string;
        };
        aiPersona?: {
          engine: AiPersonaEngine;
        };
      }[]
    >;
  };
}

const useVirtualContributorsAdmin = ({
  level,
  currentMembers,
  spaceL0Id,
}: useVirtualContributorsAdminParams): useVirtualContributorsAdminProvided => {
  // Filter functions for contributors already in the role
  const filterByName = (vc: ContributorNameProps, filter?: string) =>
    vc.profile.displayName.toLowerCase().includes(filter?.toLowerCase() ?? '');

  const filterExisting = (currentMembers: Identifiable[]) => (contributor: Identifiable) =>
    !currentMembers.some(member => member.id === contributor.id);

  // TODO: Implement ServerSide pagination and filtering for VCs
  const mockPaginatedResponse = <T>(virtualContributors: T[], refetch: () => Promise<unknown>) => ({
    virtualContributors,
    refetch,
    hasMore: false,
    loading: false,
    fetchMore: () => Promise.resolve(),
  });
  const filterExistingVcs = filterExisting(currentMembers);

  //////
  // Library
  const [fetchAvailableVirtualContributorsInLibrary] = useAvailableVirtualContributorsInLibraryLazyQuery();
  const findAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    const { data, refetch } = await fetchAvailableVirtualContributorsInLibrary();

    const virtualContributors = (data?.platform.library.virtualContributors ?? []).filter(
      vc => vc.searchVisibility === SearchVisibility.Public && filterByName(vc, filter) && filterExistingVcs(vc)
    );

    return mockPaginatedResponse(virtualContributors, refetch);
  };

  const getAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    const { virtualContributors } = await findAvailableVirtualContributorsInLibrary(filter);
    return virtualContributors;
  };

  //////
  // Space
  const [fetchAvailableVirtualContributorsInSpaceAccount] = useAvailableVirtualContributorsInSpaceAccountLazyQuery();
  const [fetchAvailableVirtualContributorsInSpaceL0] = useAvailableVirtualContributorsInSpaceL0LazyQuery();
  const findAvailableVirtualContributors = async (filter: string | undefined) => {
    // Get from Account on SpaceL0
    if (level === SpaceLevel.L0) {
      const { data, refetch } = await fetchAvailableVirtualContributorsInSpaceAccount({
        variables: {
          spaceId: spaceL0Id!,
        },
      });
      // data?.lookup?.space?.account.virtualContributors is always an array
      const virtualContributors = data?.lookup?.space?.account.virtualContributors ?? [];
      const filteredVCs = virtualContributors.filter(vc => filterByName(vc, filter) && filterExistingVcs(vc));
      return mockPaginatedResponse(filteredVCs, refetch);
    }

    // Get from L0 space for subspaces
    const { data, refetch } = await fetchAvailableVirtualContributorsInSpaceL0({
      variables: {
        spaceId: spaceL0Id!,
      },
    });
    // TODO: when move over to paginated handling of VCs fully then this can be removed
    // For now convert to the mockPaginatedResponse. Note: the filtering is done on the server to remove
    // VCs from the list that are already a member.
    const virtualContributorsPaginated =
      data?.lookup?.space?.community.roleSet.availableVirtualContributorsForEntryRole;
    const virtualContributors = virtualContributorsPaginated?.virtualContributors ?? [];
    return mockPaginatedResponse(virtualContributors, refetch);
  };

  const getAvailableVirtualContributors = async (filter: string | undefined) => {
    const { virtualContributors } = await findAvailableVirtualContributors(filter);
    return virtualContributors;
  };

  return {
    virtualContributorAdmin: {
      getAvailable: getAvailableVirtualContributors,
      getAvailableInLibrary: getAvailableVirtualContributorsInLibrary,
    },
  };
};

export default useVirtualContributorsAdmin;
