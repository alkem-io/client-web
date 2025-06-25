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

export interface ContributorItem {
  id: string;
  profile: {
    displayName: string;
    description?: string;
    location?: {
      city?: string;
      country?: string;
    };
    visual?: {
      uri: string;
    };
  };
}

export interface UseContributorsResult {
  data: ContributorItem[];
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => void;
}

export interface UseContributorsParams {
  filter?: UserFilterInput;
  parentSpaceId?: string;
  onlyUsersInRole: boolean;
  pageSize?: number;
}

/**
 * Fetch contributors either from a space's role set (RoleName.Member) or via a paginated user query.
 * The hook switches mode based on `onlyUsersInRole` and `parentSpaceId`.
 * @param {UseContributorsParams} params - Configuration for filtering and mode selection.
 * @returns {UseContributorsResult} - Object containing contributor data, loading state, and pagination controls.
 */
export const useContributors = ({
  filter,
  parentSpaceId,
  onlyUsersInRole,
  pageSize = 20,
}: UseContributorsParams): UseContributorsResult => {
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

  const roleSetData = useMemo(
    () =>
      (usersByRole[RoleName.Member] ?? []).map(user => ({
        ...user,
        profile: {
          ...user.profile,
          visual: user.profile.avatar, // to match the expected shape
        },
      })),
    [usersByRole]
  );

  if (onlyUsersInRole && parentSpaceId) {
    return { data: roleSetData, loading: loadingUsersByRoleSet || loadingRoleSet, hasMore: false, fetchMore: () => {} };
  } else {
    return { data: paginatedData?.usersPaginated.users ?? [], loading, hasMore, fetchMore };
  }
};
