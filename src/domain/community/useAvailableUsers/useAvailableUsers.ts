import useUsersSearch from '../useAvailableMembersWithCredential/useUsersSearch';
import usePaginatedQuery, { PaginationVariables } from '../../shared/pagination/usePaginatedQuery';
import { useHub } from '../../../hooks';
import { UseAvailableUsersProvided } from './types/AvailableUsers';
import { QueryHookOptions, QueryResult } from '@apollo/client/react/types/types';
import { UserFilterInput } from '../useAvailableMembersWithCredential/types';
import { PageInfo, UserDisplayNameFragment } from '../../../models/graphql-schema';
import somePropsNotDefined from '../../shared/utils/somePropsNotDefined';

const PAGE_SIZE = 10;
const EMPTY_USERS_LIST = [];

export interface VariablesWithFilter {
  filter?: UserFilterInput | undefined;
}

export interface HubIdHolder {
  hubId: string;
}

type FullQueryVariables<Variables extends {}> = Variables & PaginationVariables & VariablesWithFilter & HubIdHolder;

export interface UseAvailableLeadUsersOptions<Data, Variables extends {}> {
  useQuery: (
    options: QueryHookOptions<Data, FullQueryVariables<Variables>>
  ) => QueryResult<Data, FullQueryVariables<Variables>>;
  variables: Partial<Variables>;
  getResult: (data: Data) =>
    | {
        pageInfo: Omit<PageInfo, 'hasPreviousPage'>;
        users: UserDisplayNameFragment[];
      }
    | undefined;
}

const useAvailableUsers = <Data, Variables extends {}>({
  useQuery,
  variables,
  getResult,
}: UseAvailableLeadUsersOptions<Data, Variables>): UseAvailableUsersProvided => {
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
    useQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: !hubId && somePropsNotDefined(variables),
    },
    pageSize: PAGE_SIZE,
    variables: { ...variables, hubId, filter } as Omit<FullQueryVariables<Variables>, keyof PaginationVariables>,
    getPageInfo: data => getResult(data)?.pageInfo,
  });

  const isLoading = loadingUsers || loadingHub;
  const hasError = !!userError;
  const availableMembers = (usersQueryData && getResult(usersQueryData)?.users) ?? EMPTY_USERS_LIST;
  const setSearchTerm = setPaginatedUsersSearchTerm;

  return {
    availableMembers,
    error: hasError,
    loading: isLoading,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
    setSearchTerm,
  };
};

export default useAvailableUsers;
