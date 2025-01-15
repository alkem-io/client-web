/*import { useAvailableUsersForElevatedRoleLazyQuery, usePlatformRoleAvailableUsersLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { PartialRecord } from '@/core/utils/PartialRecords';
import { useState } from 'react';

const PAGE_SIZE = 2;

type AvailableUsersResponse = {
  users: {
    id: string;
    profile: {
      displayName: string;
    }
    email?: string;
  }[];
  hasMore: boolean;
  fetchMore: () => Promise<unknown>;
  total: number;
}

type useRoleSetAdminQueriesParams = {
  roleSetId: 'platform' | string | undefined;
}
export type useRoleSetAdminQueriesProvided = {
  getPlatformAvailableUsersForRole: (filter: string) => Promise<AvailableUsersResponse>;
  getAvailableUsersForRole: (role: RoleName, filter: string) => Promise<AvailableUsersResponse>;
  loading: boolean;
}

const useRoleSetAdminAvailableUsers = ({ roleSetId }: useRoleSetAdminQueriesParams): useRoleSetAdminQueriesProvided => {
  const [platformUsers, setPlatformUsers] = useState<AvailableUsersResponse['users'] | undefined>(undefined);
  const [getPlatformUsers, { loading: loadingPlatform }] = usePlatformRoleAvailableUsersLazyQuery();

  const getPlatformAvailableUsersForRole = async (filter: string): Promise<AvailableUsersResponse> => {
    const runQuery = (after?: string) => {
      return getPlatformUsers({
        variables: {
          first: PAGE_SIZE,
          filter: {
            displayName: filter,
          },
          after
        },
      });
    }

    const result = await runQuery();
    const firstPage = result.data?.usersPaginated;
    const pageInfo = firstPage?.pageInfo;
    setPlatformUsers(firstPage?.users);
    const fetchMore = async () => {
      const after = (platformUsers && platformUsers?.length > 0) ? platformUsers[platformUsers.length - 1].id : undefined;
      const results = await runQuery(after);
      const nextPage = results.data?.usersPaginated;
      setPlatformUsers([...(platformUsers ?? []), ...(nextPage?.users ?? [])]);
    }

    return {
      users: platformUsers ?? [],
      hasMore: pageInfo?.hasNextPage ?? false,
      fetchMore,
      total: firstPage?.total ?? 0
    };
  };


  // For normal rolesets (not platform roles), we need to fetch the users for each role
  const [roleSetAvailableUsers, setRoleSetAvailableUsers] = useState<PartialRecord<RoleName, AvailableUsersResponse['users'] | undefined>>({});
  const [getAvailableUsersForElevatedRole, { loading: loadingRoleSet }] = useAvailableUsersForElevatedRoleLazyQuery();

  const getAvailableUsersForRole = async (role: RoleName, filter: string) => {
    if (!roleSetId) {
      throw new Error('RoleSetId is required');
    }
    const runQuery = (after?: string) => {
      return getAvailableUsersForElevatedRole({
        variables: {
          role,
          roleSetId: roleSetId!,
          first: PAGE_SIZE,
          filter: {
            displayName: filter,
          },
          after
        },
      });
    }

    const result = await runQuery();
    const firstPage = result.data?.lookup.roleSet?.availableUsersForElevatedRole;
    const pageInfo = firstPage?.pageInfo;
    const availableUsersByRoleSet = {
      ...roleSetAvailableUsers,
      [role]: firstPage?.users
    };
    setRoleSetAvailableUsers(availableUsersByRoleSet);
    const fetchMore = async () => {
      const after = (roleSetAvailableUsers[role] && roleSetAvailableUsers[role]?.length > 0) ? roleSetAvailableUsers[role][roleSetAvailableUsers[role].length - 1].id : undefined;
      const results = await runQuery(after);
      const nextPage = results.data?.lookup.roleSet?.availableUsersForElevatedRole;
      setRoleSetAvailableUsers({
        ...roleSetAvailableUsers,
        [role]: [...(roleSetAvailableUsers[role] ?? []), ...(nextPage?.users ?? [])]
      });
    }

    return {
      users: roleSetAvailableUsers[role] ?? [],
      hasMore: pageInfo?.hasNextPage ?? false,
      fetchMore,
      total: firstPage?.total ?? 0
    };
  }


  return {
    getPlatformAvailableUsersForRole,
    getAvailableUsersForRole,
    loading: loadingPlatform || loadingRoleSet
  };
}

export default useRoleSetAdminAvailableUsers;*/
