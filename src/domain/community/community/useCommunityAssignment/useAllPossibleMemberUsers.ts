import { UserDisplayNameFragment } from '../../../../core/apollo/generated/graphql-schema';
import useUsersSearch, { UseUsersSearchResult } from '../useAvailableMembersWithCredential/useUsersSearch';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';
import { useAvailableUsersQuery, useCommunityMembersQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import useLocalSearch from '../../../shared/utils/useLocalSearch';

export interface UseAllPossibleMemberUsersProvided {
  allPossibleMemberUsers: UserDisplayNameFragment[] | undefined;
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
}

export interface UseAllPossibleMemberUsersOptions {
  parentCommunityId?: string;
}

const PAGE_SIZE = 10;

const useAllPossibleMemberUsers = (
  options: UseAllPossibleMemberUsersOptions = {}
): UseAllPossibleMemberUsersProvided => {
  const { parentCommunityId } = options;

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
      skip: Boolean(parentCommunityId),
    },
    pageSize: PAGE_SIZE,
    variables: { filter },
    getPageInfo: data => data?.usersPaginated.pageInfo,
  });

  const { hubId, loading: loadingHub } = useHub();

  const {
    data: _parentCommunityMembers,
    loading: loadingParentCommunityMembers,
    error: parentCommunityMembersError,
  } = useCommunityMembersQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !hubId || !parentCommunityId,
    variables: {
      hubId,
      communityId: parentCommunityId!, // presence checked by skip condition
    },
  });

  const { data: filteredParentCommunityMembers, setSearchTerm: setParentCommunityMembersSearchTerm } = useLocalSearch({
    data: _parentCommunityMembers?.hub.community?.memberUsers,
    isMatch: (user, searchTerm) => user.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
  });

  const isLoading = loadingUsers || loadingHub || loadingParentCommunityMembers;
  const hasError = !!(userError || parentCommunityMembersError);
  const allPossibleMemberUsers = filteredParentCommunityMembers || usersQueryData?.usersPaginated.users;

  const setSearchTerm = parentCommunityId ? setParentCommunityMembersSearchTerm : setPaginatedUsersSearchTerm;

  return {
    allPossibleMemberUsers,
    error: hasError,
    loading: isLoading,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
    setSearchTerm,
  };
};

export default useAllPossibleMemberUsers;
