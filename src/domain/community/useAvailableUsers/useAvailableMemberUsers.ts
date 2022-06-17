import useUsersSearch from '../useAvailableMembersWithCredential/useUsersSearch';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';
import { useHubCommunityAvailableMemberUsersQuery } from '../../../hooks/generated/graphql';
import { useHub } from '../../../hooks';
import { UseAvailableUsersProvided } from './types/AvailableUsers';

const PAGE_SIZE = 10;
const EMPTY_USERS_LIST = [];

const useAvailableMemberUsers = (): UseAvailableUsersProvided => {
  const { filter, setSearchTerm: setPaginatedUsersSearchTerm } = useUsersSearch();
  const { hubId, loading: loadingHub } = useHub();

  const {
    data: usersQueryData,
    loading: loadingUsers,
    error: userError,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
  } = usePaginatedQuery({
    useQuery: useHubCommunityAvailableMemberUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: !hubId,
    },
    pageSize: PAGE_SIZE,
    variables: { hubId, filter },
    getPageInfo: data => data?.hub?.community?.availableMemberUsers?.pageInfo,
  });

  const isLoading = loadingUsers || loadingHub;
  const hasError = !!userError;
  const allPossibleMemberUsers = usersQueryData?.hub?.community?.availableMemberUsers?.users || EMPTY_USERS_LIST;

  const setSearchTerm = setPaginatedUsersSearchTerm;

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

export default useAvailableMemberUsers;
