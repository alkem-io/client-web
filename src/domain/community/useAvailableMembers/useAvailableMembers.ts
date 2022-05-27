import { useMemo } from 'react';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../models/graphql-schema';
import {
  useAvailableUsersQuery,
  useCommunityMembersQuery,
  useUsersWithCredentialsSimpleListQuery,
} from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import { useHub } from '../../../hooks/useHub';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';
import useUsersSearch, { UseUsersSearchResult } from './useUsersSearch';
import useLocalSearch from '../../shared/utils/useLocalSearch';

export interface AvailableMembersResults {
  available: UserDisplayNameFragment[];
  current: Member[];
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
}

const PAGE_SIZE = 10;

interface CurrentUserAttrs {
  credential: AuthorizationCredential;
  resourceId?: string;
}

interface CommunityMembersAttrs {
  parentCommunityId?: string;
}

export type UseAvailableMembersOptions = CurrentUserAttrs & CommunityMembersAttrs;

const EMPTY_MEMBERS_LIST: UserDisplayNameFragment[] = [];

/***
 * Hook to fetch available users in a curtain context, defined by the parent members (if applicable),
 * the credential type of the authorization group and the resource
 * @param options.credential The credential type of the authorization group
 * @param options.resourceId The resource
 * @param options.parentCommunityId The parent entity community id (if applicable)
 * @param options.filter
 */
// todo: merge with useAvailableMembers when pagination and filtering is stable
export const useAvailableMembers = (options: UseAvailableMembersOptions): AvailableMembersResults => {
  const { credential, resourceId } = options;

  const { filter, setSearchTerm: setPaginatedUsersSearchTerm } = useUsersSearch();

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
      skip: Boolean(options.parentCommunityId),
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
    skip: !hubId || !options.parentCommunityId,
    variables: {
      hubId,
      communityId: options.parentCommunityId!, // presence checked by skip condition
    },
  });

  const { data: filteredParentCommunityMembers, setSearchTerm: setParentCommunityMembersSearchTerm } = useLocalSearch({
    data: _parentCommunityMembers?.hub.community?.memberUsers,
    isMatch: (user, searchTerm) => user.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
  });

  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading = loadingUsers || loadingMembers || loadingHub || loadingParentCommunityMembers;
  const hasError = !!(membersError || userError || parentCommunityMembersError);
  const entityMembers = filteredParentCommunityMembers || usersQueryData?.usersPaginated.users || EMPTY_MEMBERS_LIST;

  const availableMembers = useMemo<UserDisplayNameFragment[]>(
    () => entityMembers.filter(member => !current.some(user => user.id === member.id)),
    [entityMembers, current]
  );

  const setSearchTerm = options.parentCommunityId ? setParentCommunityMembersSearchTerm : setPaginatedUsersSearchTerm;

  return {
    available: availableMembers,
    current: current,
    error: hasError,
    loading: isLoading,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
    setSearchTerm,
  };
};
