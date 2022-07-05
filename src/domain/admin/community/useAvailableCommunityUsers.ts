import { AvailableUserFragment, PageInfoFragment, UserFilterInput } from '../../../models/graphql-schema';
import useUsersSearch, { UseUsersSearchResult } from '../../community/useAvailableMembersWithCredential/useUsersSearch';
import usePaginatedQuery, {
  NonPaginationVariables,
  PaginationOptionsLazy,
  PaginationVariables,
} from '../../shared/pagination/usePaginatedQuery';

export interface UserFilterHolder {
  filter?: UserFilterInput;
}

export interface AvailableCommunityUsersOptions<Data, Variables extends UserFilterHolder & PaginationVariables> {
  useLazyQuery: PaginationOptionsLazy<Data, Variables>['useLazyQuery'];
  variables: Omit<NonPaginationVariables<Variables>, 'filter'>;
  getResult: (data: Data) =>
    | {
        users: AvailableUserFragment[] | undefined;
        pageInfo: PageInfoFragment;
      }
    | undefined;
}

interface AvailableMembersProvided {
  allPossibleMemberUsers: AvailableUserFragment[] | undefined;
  fetchMore: (amount?: number) => Promise<void>;
  loadAvailableMembers: () => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
}

const useAvailableCommunityUsers = <Data, Variables extends UserFilterHolder & PaginationVariables>({
  useLazyQuery,
  variables,
  getResult,
}: AvailableCommunityUsersOptions<Data, Variables>): AvailableMembersProvided => {
  const { filter, setSearchTerm } = useUsersSearch();

  const { data, error, loadQuery, ...queryProps } = usePaginatedQuery({
    useLazyQuery,
    variables: { ...variables, filter } as NonPaginationVariables<Variables>,
    getPageInfo: data => getResult(data)?.pageInfo,
    pageSize: 10,
    options: {
      fetchPolicy: 'cache-and-network',
    },
  });

  return {
    allPossibleMemberUsers: data && getResult(data)?.users,
    ...queryProps,
    error: !!error,
    setSearchTerm,
    loadAvailableMembers: loadQuery,
  };
};

export default useAvailableCommunityUsers;
