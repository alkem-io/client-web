import { usePlatformRoleAvailableUsersQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import useRoleSetAdmin from '../useRoleSetAdmin';
import { useMemo, useState } from 'react';

type usePlatformRoleSetAdminAvailableUsersParams = {
  roleSetId: string | undefined;
  role?: RoleName;
  filter?: string;
  skip?: boolean;
};

export interface usePlatformRoleSetAdminAvailableUsersProvided extends AvailableUsersResponse {}

const usePlatformRoleSetAdminAvailableUsers = ({
  roleSetId,
  role,
  filter,
  skip,
}: usePlatformRoleSetAdminAvailableUsersParams): usePlatformRoleSetAdminAvailableUsersProvided => {
  const [refetchToken, setRefetchToken] = useState(0);
  const { usersByRole, loading: loadingCurrentUsers } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [role!],
    contributorTypes: ['user'],
    skip: skip || !role,
  });

  const { data, loading, fetchMore, hasMore } = usePaginatedQuery({
    useQuery: usePlatformRoleAvailableUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip,
    },
    pageSize: AVAILABLE_USERS_PAGE_SIZE,
    variables: { filter: { displayName: filter } },
    getPageInfo: data => data?.usersPaginated.pageInfo,
  });

  const firstPage = data?.usersPaginated;
  const users = useMemo(() => {
    if (!firstPage?.users) {
      return [];
    }
    if (loadingCurrentUsers || !role || !usersByRole || !usersByRole[role]) {
      return firstPage.users;
    }
    // Exclude users which already have the role
    const currentUsers = usersByRole[role];
    return firstPage.users.filter(user => !currentUsers?.find(current => current.id === user.id));
  }, [firstPage, loading, role, usersByRole, loadingCurrentUsers, filter, skip, refetchToken]);

  return {
    users,
    hasMore: hasMore ?? false,
    fetchMore,
    loading,
    refetch: async () => setRefetchToken(() => refetchToken + 1),
  };
};

export default usePlatformRoleSetAdminAvailableUsers;
