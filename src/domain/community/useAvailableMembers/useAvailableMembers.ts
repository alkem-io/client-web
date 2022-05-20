import { useMemo } from 'react';
import { AuthorizationCredential, UserDisplayNameFragment, UserFilterInput } from '../../../models/graphql-schema';
import {
  useAvailableUsersQuery,
  useCommunityMembersQuery,
  useUsersWithCredentialsSimpleListQuery,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import { useHub } from '../../../hooks/useHub';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';

export interface AvailableMembersResults {
  available: UserDisplayNameFragment[];
  current: Member[];
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
}

const PAGE_SIZE = 10;

interface CurrentUserAttrs {
  credential: AuthorizationCredential;
  resourceId?: string;
}

interface CommunityMembersAttrs {
  parentCommunityId?: string;
}

interface OrganizationMembersAttrs {
  parentMembers: Member[];
}

export interface FilterOptions {
  filter?: UserFilterInput;
}

export type UseAvailableMembersOptions = CurrentUserAttrs &
  FilterOptions &
  (CommunityMembersAttrs | OrganizationMembersAttrs);

const EMPTY = [];

/***
 * Hook to fetch available users in a curtain context, defined by the parent members (if applicable),
 * the credential type of the authorization group and the resource
 * @param options.credential The credential type of the authorization group
 * @param options.resourceId The resource
 * @param options.parentCommunityId The parent entity community id (if applicable)
 * @param options.parentMembers
 * @param options.filter
 */
// todo: merge with useAvailableMembers when pagination and filtering is stable
export const useAvailableMembers = (options: UseAvailableMembersOptions): AvailableMembersResults => {
  const { filter = { firstName: '', lastName: '', email: '' }, credential, resourceId } = options;

  // const shouldFetchEntityUsers = 'parentMembers' in options || typeof options.parentCommunityId !== 'undefined';

  const {
    data: usersQueryData,
    loading: loadingUsers,
    error: userError,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
  } = usePaginatedQuery({
    useQuery: useAvailableUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: false,
    },
    pageSize: PAGE_SIZE,
    variables: { filter },
    getPageInfo: data => data?.usersPaginated.pageInfo,
  });

  const {
    data: _current,
    loading: loadingMembers,
    error: membersError,
  } = useUsersWithCredentialsSimpleListQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const { hubId, loading: loadingHub } = useHub();

  const {
    data: _parentCommunityMembers,
    loading: loadingParentCommunityMembers,
    error: parentCommunityMembersError,
  } = useCommunityMembersQuery({
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    variables: {
      hubId,
      // Because hooks aren't to be called conditionally, we can't rely on type guards
      communityId: 'parentMembers' in options ? (null as never) : options.parentCommunityId!,
    },
    skip: Boolean('parentMembers' in options || !hubId || !options.parentCommunityId),
  });

  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading = loadingUsers || loadingMembers || loadingHub || loadingParentCommunityMembers;
  const hasError = !!(membersError || userError || parentCommunityMembersError);
  const entityMembers = (('parentMembers' in options ? options.parentMembers : undefined) ||
    _parentCommunityMembers?.hub.community?.memberUsers ||
    usersQueryData?.usersPaginated.users ||
    EMPTY) as UserDisplayNameFragment[]; // having inline [] makes useMemo() below useless

  const availableMembers = useMemo<UserDisplayNameFragment[]>(
    () => entityMembers.filter(member => !current.some(user => user.id === member.id)),
    [entityMembers, current]
  );

  return {
    available: availableMembers,
    current: current,
    error: hasError,
    loading: isLoading,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
  };
};
