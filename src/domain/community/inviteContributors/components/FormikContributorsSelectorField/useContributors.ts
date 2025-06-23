import { useMemo } from 'react';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { useInviteUsersDialogQuery, useUserSelectorQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  UserSelectorQuery,
  UserSelectorQueryVariables,
  UserFilterInput,
  RoleSetContributorType,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

export interface UseContributorsParams {
  filter?: UserFilterInput;
  parentSpaceId?: string;
  onlyUsersInRole: boolean;
  pageSize?: number;
}

export const useContributors = ({ filter, parentSpaceId, onlyUsersInRole, pageSize = 20 }: UseContributorsParams) => {
  const { data: parentSpace, loading: loadingRoleSet } = useInviteUsersDialogQuery({
    variables: {
      spaceId: parentSpaceId!,
    },
    skip: !onlyUsersInRole || !parentSpaceId,
  });

  const parentRoleSetId = parentSpace?.lookup.space?.about.membership.roleSetID;

  const { usersByRole, loading: loadingUsersByRoleSet } = useRoleSetManager({
    roleSetId: parentRoleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.User],
    fetchContributors: true,
    skip: !onlyUsersInRole || !parentSpaceId || !parentRoleSetId,
  });

  const {
    data: paginatedData,
    loading,
    fetchMore,
    hasMore,
  } = usePaginatedQuery<UserSelectorQuery, UserSelectorQueryVariables>({
    useQuery: useUserSelectorQuery,
    getPageInfo: data => data.usersPaginated.pageInfo,
    options: { skip: !filter || onlyUsersInRole },
    pageSize,
    variables: { filter },
  });

  if (onlyUsersInRole && parentSpaceId) {
    const data = useMemo(
      () =>
        (usersByRole[RoleName.Member] ?? []).map(user => ({
          ...user,
          profile: {
            ...user.profile,
            visual: user.profile.avatar,
          },
        })),
      [usersByRole]
    );

    return { data, loading: loadingUsersByRoleSet || loadingRoleSet, hasMore: false, fetchMore: () => {} };
  } else {
    const data = paginatedData?.usersPaginated.users ?? [];

    return { data, loading, hasMore, fetchMore };
  }
};
