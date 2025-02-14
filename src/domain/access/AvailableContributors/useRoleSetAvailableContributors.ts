import {
  useAvailableOrganizationsLazyQuery,
  useAvailableUsersForElevatedRoleLazyQuery,
  useAvailableUsersForEntryRoleLazyQuery,
  useAvailableVirtualContributorsInLibraryLazyQuery,
  useAvailableVirtualContributorsLazyQuery,
  usePlatformRoleAvailableUsersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
  AvailableOrganizationsResponse,
  AvailableUsersResponse,
  AvailableVirtualContributorsResponse,
} from './common';
import { Identifiable } from '@/core/utils/Identifiable';
import { RoleName, SearchVisibility, SpaceLevel } from '@/core/apollo/generated/graphql-schema';

interface ContributorNameProps extends Identifiable {
  profile: {
    displayName: string;
  };
}

type useRoleSetAvailableContributorsParams = {
  roleSetId: string | undefined;
  filterCurrentMembers?: Identifiable[];
};

interface useRoleSetAvailableContributorsProvided {
  findAvailableUsersForRoleSetEntryRole: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForRoleSetElevatedRole: (role: RoleName, filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForPlatformRoleSet: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableOrganizationsForRoleSet: (filter?: string) => Promise<AvailableOrganizationsResponse>;
  findAvailableVirtualContributorsInLibrary: (filter?: string) => Promise<AvailableVirtualContributorsResponse>;
  findAvailableVirtualContributorsForRoleSet: (
    spaceLevel: SpaceLevel | undefined,
    spaceId: string | undefined,
    all?: boolean,
    filter?: string
  ) => Promise<AvailableVirtualContributorsResponse>;
  refetch: () => Promise<unknown>;
  loading: boolean;
}

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

// Filter functions for contributors already in the role
const filterByName = (vc: ContributorNameProps, filter?: string) =>
  vc.profile.displayName.toLowerCase().includes(filter?.toLowerCase() ?? '');

const filterExisting = (currentMembers: Identifiable[]) => (contributor: Identifiable) =>
  !currentMembers.some(member => member.id === contributor.id);

const useRoleSetAvailableContributors = ({
  roleSetId,
  filterCurrentMembers = [],
}: useRoleSetAvailableContributorsParams): useRoleSetAvailableContributorsProvided => {
  const [
    fetchAvailableUsersForRoleSetEntryRole,
    { loading: loadingAvailableUsersForRoleSetEntryRole, refetch: refetchAvailableUsersForRoleSetEntryRole },
  ] = useAvailableUsersForEntryRoleLazyQuery();
  const findAvailableUsersForRoleSetEntryRole = async (filterString: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const filter = buildUserFilterObject(filterString);
    const { data, fetchMore, refetch, loading } = await fetchAvailableUsersForRoleSetEntryRole({
      variables: {
        roleSetId: roleSetId!,
        first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
        filter,
      },
    });
    return {
      users: data?.lookup.roleSet?.availableUsersForEntryRole.users ?? [],
      hasMore: data?.lookup.roleSet?.availableUsersForEntryRole.pageInfo.hasNextPage ?? false,
      refetch,
      loading,
      fetchMore: () =>
        fetchMore({
          variables: {
            roleSetId,
            first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
            after: data?.lookup.roleSet?.availableUsersForEntryRole.pageInfo.endCursor,
            filter,
          },
        }),
    };
  };

  const [
    fetchAvailableUsersForRoleSetElevatedRole,
    { loading: loadingAvailableUsersForRoleSetElevatedRole, refetch: refetchAvailableUsersForRoleSetElevatedRole },
  ] = useAvailableUsersForElevatedRoleLazyQuery();
  const findAvailableUsersForRoleSetElevatedRole = async (role: RoleName, filterString: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const filter = buildUserFilterObject(filterString);
    const { data, fetchMore, refetch, loading } = await fetchAvailableUsersForRoleSetElevatedRole({
      variables: {
        roleSetId: roleSetId!,
        role: role,
        first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
        filter,
      },
    });
    return {
      users: data?.lookup.roleSet?.availableUsersForElevatedRole.users ?? [],
      hasMore: data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo.hasNextPage ?? false,
      refetch,
      loading,
      fetchMore: () =>
        fetchMore({
          variables: {
            roleSetId,
            first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
            after: data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo.endCursor,
            filter,
          },
        }),
    };
  };

  const [
    fetchAvailableUsersForPlatformRoleSet,
    { loading: loadingAvailableUsersForPlatformRoleSet, refetch: refetchAvailableUsersForPlatformRoleSet },
  ] = usePlatformRoleAvailableUsersLazyQuery();
  const findAvailableUsersForPlatformRoleSet = async (filterString: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const filter = buildUserFilterObject(filterString);
    const { data, fetchMore, refetch, loading } = await fetchAvailableUsersForPlatformRoleSet({
      variables: {
        first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
        filter: filter,
      },
    });
    return {
      users: data?.usersPaginated.users ?? [],
      hasMore: data?.usersPaginated.pageInfo.hasNextPage ?? false,
      refetch,
      loading,
      fetchMore: () =>
        fetchMore({
          variables: {
            roleSetId,
            first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
            after: data?.usersPaginated.pageInfo.endCursor,
            filter,
          },
        }),
    };
  };

  const [
    fetchAvailableOrganizationsForRoleSet,
    { loading: loadingAvailableOrganizationsForRoleSet, refetch: refetchAvailableOrganizationsForRoleSet },
  ] = useAvailableOrganizationsLazyQuery();
  const findAvailableOrganizationsForRoleSet = async (filterString: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const filter = buildOrganizationFilterObject(filterString);
    const { data, fetchMore, refetch, loading } = await fetchAvailableOrganizationsForRoleSet({
      variables: {
        first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
        filter: filter,
      },
    });
    return {
      organizations: data?.organizationsPaginated.organization.filter(filterExisting(filterCurrentMembers)) ?? [],
      hasMore: data?.organizationsPaginated.pageInfo.hasNextPage ?? false,
      refetch,
      loading,
      fetchMore: () =>
        fetchMore({
          variables: {
            roleSetId,
            first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
            after: data?.organizationsPaginated.pageInfo.endCursor,
            filter,
          },
        }),
    };
  };

  // TODO: Implement ServerSide pagination and filtering for VCs
  const mockPaginatedResponse = <T>(virtualContributors: T[], refetch: () => Promise<unknown>) => ({
    virtualContributors,
    refetch,
    hasMore: false,
    loading: false,
    fetchMore: () => Promise.resolve(),
  });
  const filterExistingVcs = filterExisting(filterCurrentMembers);

  const [
    fetchAvailableVirtualContributorsInLibrary,
    { loading: loadingAvailableVirtualContributorsInLibrary, refetch: refetchAvailableVirtualContributorsInLibrary },
  ] = useAvailableVirtualContributorsInLibraryLazyQuery();

  // @@@ WIP ~ #7669 - VCs from Lib ⬇️
  const findAvailableVirtualContributorsInLibrary = async (filter: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const { data, refetch } = await fetchAvailableVirtualContributorsInLibrary(); // @@@ WIP ~ #7669 - VCs from Lib

    const virtualContributors = (data?.platform.library.virtualContributors ?? []).filter(
      vc => vc.searchVisibility === SearchVisibility.Public && filterByName(vc, filter) && filterExistingVcs(vc)
    );

    return mockPaginatedResponse(virtualContributors, refetch);
  };

  const [
    fetchAvailableVirtualContributorsForRoleSet,
    { loading: loadingAvailableVirtualContributorsForRoleSet, refetch: refetchAvailableVirtualContributorsForRoleSet },
  ] = useAvailableVirtualContributorsLazyQuery();

  // @@@ WIP ~ #7669 - VCs from account ⬇️
  const findAvailableVirtualContributorsForRoleSet = async (
    spaceLevel: SpaceLevel | undefined,
    spaceId: string | undefined,
    all: boolean = false,
    filter?: string
  ) => {
    // @@@ WIP ~ #7669 - VCs from account ⬇️
    const { data, refetch } = await fetchAvailableVirtualContributorsForRoleSet({
      variables: {
        filterSpace: !all || spaceLevel !== SpaceLevel.L0,
        filterSpaceId: spaceId,
      },
    });
    const roleSet = data?.lookup?.space?.community?.roleSet;

    // Results for Space Level - on Account if !all (filter in the query)
    if (spaceLevel === SpaceLevel.L0) {
      return mockPaginatedResponse(
        (data?.lookup?.space?.account.virtualContributors ?? data?.virtualContributors ?? []).filter(
          vc => filterByName(vc, filter) && filterExistingVcs(vc)
        ),
        refetch
      );
    }

    // Results for Subspaces - Community Members including External VCs (filter in the query)
    if (all) {
      return mockPaginatedResponse(
        (roleSet?.virtualContributorsInRole ?? []).filter(vc => filterByName(vc, filter) && filterExistingVcs(vc)),
        refetch
      );
    }

    // Results for Subspaces - Only Community Members On Account (filter in the query)
    return mockPaginatedResponse(
      (roleSet?.virtualContributorsInRole ?? []).filter(
        vc =>
          data?.lookup?.space?.account.virtualContributors.some(member => member.id === vc.id) &&
          filterByName(vc, filter) &&
          filterExistingVcs(vc)
      ),
      refetch
    );
  };

  return {
    loading:
      loadingAvailableOrganizationsForRoleSet ||
      loadingAvailableUsersForRoleSetEntryRole ||
      loadingAvailableUsersForRoleSetElevatedRole ||
      loadingAvailableUsersForPlatformRoleSet ||
      loadingAvailableVirtualContributorsInLibrary ||
      loadingAvailableVirtualContributorsForRoleSet,
    refetch: () =>
      Promise.all([
        () => refetchAvailableUsersForRoleSetEntryRole(),
        () => refetchAvailableUsersForRoleSetElevatedRole(),
        () => refetchAvailableUsersForPlatformRoleSet(),
        () => refetchAvailableOrganizationsForRoleSet(),
        () => refetchAvailableVirtualContributorsInLibrary(),
        () => refetchAvailableVirtualContributorsForRoleSet(),
      ]),
    findAvailableUsersForRoleSetEntryRole,
    findAvailableUsersForRoleSetElevatedRole,
    findAvailableUsersForPlatformRoleSet,
    findAvailableOrganizationsForRoleSet,
    findAvailableVirtualContributorsInLibrary,
    findAvailableVirtualContributorsForRoleSet,
  };
};

export default useRoleSetAvailableContributors;
