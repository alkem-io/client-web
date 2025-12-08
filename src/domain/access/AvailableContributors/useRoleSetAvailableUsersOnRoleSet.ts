import { useAvailableUsersForElevatedRoleQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useCallback } from 'react';

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
  // Call the query hook directly instead of passing it to usePaginatedQuery
  const { data, loading, fetchMore: fetchMoreRaw, refetch } = useAvailableUsersForElevatedRoleQuery({
    variables: {
      first: AVAILABLE_USERS_PAGE_SIZE,
      roleSetId: roleSetId!,
      role: role!,
      filter: { displayName: filter },
    },
    skip: skip || !roleSetId || !role,
  });

  const pageInfo = data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;

  const fetchMore = useCallback(
    async (itemsNumber = AVAILABLE_USERS_PAGE_SIZE) => {
      if (!data) {
        return;
      }

      await fetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: pageInfo?.endCursor,
          roleSetId: roleSetId!,
          role: role!,
          filter: { displayName: filter },
        },
      });
    },
    [data, fetchMoreRaw, pageInfo?.endCursor, roleSetId, role, filter, AVAILABLE_USERS_PAGE_SIZE]
  );

  const users = data?.lookup.roleSet?.availableUsersForElevatedRole.users ?? [];

  return {
    users,
    hasMore,
    fetchMore,
    refetch,
    loading,
  };
};

export default useRoleSetAvailableUsersOnRoleSet;
