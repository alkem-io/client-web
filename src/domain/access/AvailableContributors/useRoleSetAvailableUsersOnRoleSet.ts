import { useAvailableUsersForElevatedRoleQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAvailableUsersParams = {
  roleSetId: string | undefined;
  role: RoleName | undefined;
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAvailableUsersOnRoleSetProvided extends AvailableUsersResponse {}

/**
 * @internal
 * Do not use this hook directly, normally you should use useRoleSetAvailableUsers instead
 */
const useRoleSetAvailableUsersOnRoleSet = ({
  roleSetId,
  role,
  filter,
  skip,
}: useRoleSetAvailableUsersParams): useRoleSetAvailableUsersOnRoleSetProvided => {
  const { data, loading, fetchMore, hasMore, refetch } = usePaginatedQuery({
    useQuery: useAvailableUsersForElevatedRoleQuery,
    options: {
      skip: skip || !roleSetId || !role,
    },
    pageSize: AVAILABLE_USERS_PAGE_SIZE,
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
    refetch,
    loading,
  };
};

export default useRoleSetAvailableUsersOnRoleSet;
