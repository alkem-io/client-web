import { useAvailableUsersForElevatedRoleQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE_LAZY, AvailableOrganizationsResponse, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { Identifiable } from '@/core/utils/Identifiable';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAdminAvailableUsersLazyParams = {
  roleSetId: string | undefined;
  role?: RoleName | undefined;
  usersAlreadyInRole?: Identifiable[];
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAdminAvailableUsersLazyProvided {
  findAvailableUsersForRoleSetEntryRole: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForRoleSetElevatedRole: (role: RoleName, filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForPlatformRoleSetEntryRole: (filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableUsersForPlatformRoleSetElevatedRole: (role: RoleName, filter?: string) => Promise<AvailableUsersResponse>;
  findAvailableOrganizationsForRoleSet: (filter?: string) => Promise<AvailableOrganizationsResponse>;
  findAvailableVirtualContributorsForRoleSet: (filter?: string) => Promise<AvailableOrganizationsResponse>;
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

/**
 * Do not use this hook directly, normally you should use useRoleSetAdmin instead
 */
const useRoleSetAdminAvailableUsersLazy = ({
  roleSetId,
  role,
  filter,
  skip,
}: useRoleSetAdminAvailableUsersLazyParams): useRoleSetAdminAvailableUsersLazyProvided => {

  const [fetchAvailableUsers, { refetch: refetchAvailableMemberUsers }] = useRoleSetAvailableEntryRoleUsersLazyQuery();
  const getAvailableUsers = async (filter: string | undefined) => {
    const { data } = await fetchAvailableUsers({
      variables: {
        roleSetId,
        first: AVAILABLE_USERS_PAGE_SIZE_LAZY,
        filter: buildUserFilterObject(filter),
      },
    });
    return data?.lookup.availableEntryRoleUsers?.availableUsersForEntryRole?.users;
  };

  const { data, loading, fetchMore, hasMore } = usePaginatedQuery({
    useQuery: useAvailableUsersForElevatedRoleQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: skip || !roleSetId || !role,
    },
    pageSize: AVAILABLE_USERS_PAGE_SIZE_LAZY,
    variables: {
      roleSetId: roleSetId!,
      role: role!,
      filter: { displayName: filter },
    },
    getPageInfo: data => data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo,
  });

  const users = data?.lookup.roleSet?.availableUsersForElevatedRole.users ?? [];

  return {
    users,
    hasMore: hasMore ?? false,
    fetchMore,
    loading,
  };
};

export default useRoleSetAdminAvailableUsersLazy;