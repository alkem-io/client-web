import {
  useAvailableOrganizationsLazyQuery,
  useAvailableUsersForElevatedRoleLazyQuery,
  useAvailableUsersForEntryRoleLazyQuery,
  usePlatformRoleAvailableUsersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_CONTRIBUTORS_PAGE_SIZE, AvailableOrganizationsResponse, AvailableUsersResponse } from './common';
import { Identifiable } from '@/core/utils/Identifiable';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAvailableContributorsParams = {
  roleSetId: string | undefined;
  filterCurrentMembers?: Identifiable[];
};

interface useRoleSetAvailableContributorsProvided {
  findAvailableUsersForRoleSetEntryRole: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForRoleSetElevatedRole: (role: RoleName, filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForPlatformRoleSet: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableOrganizationsForRoleSet: (filter?: string) => Promise<AvailableOrganizationsResponse>;
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

  return {
    loading:
      loadingAvailableOrganizationsForRoleSet ||
      loadingAvailableUsersForRoleSetEntryRole ||
      loadingAvailableUsersForRoleSetElevatedRole ||
      loadingAvailableUsersForPlatformRoleSet,
    refetch: () =>
      Promise.all([
        () => refetchAvailableUsersForRoleSetEntryRole(),
        () => refetchAvailableUsersForRoleSetElevatedRole(),
        () => refetchAvailableUsersForPlatformRoleSet(),
        () => refetchAvailableOrganizationsForRoleSet(),
      ]),
    findAvailableUsersForRoleSetEntryRole,
    findAvailableUsersForRoleSetElevatedRole,
    findAvailableUsersForPlatformRoleSet,
    findAvailableOrganizationsForRoleSet,
  };
};

export default useRoleSetAvailableContributors;
