import { LazyQueryHookOptions, QueryHookOptions, QueryResult, QueryTuple } from '@apollo/client/react/types/types';
import { PageInfo } from '@/core/apollo/generated/graphql-schema';
import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';

export interface PaginationVariables {
  first: number;
  after?: string;
}

export type NonPaginationVariables<Variables extends PaginationVariables> = Omit<Variables, 'first' | 'after'>;

interface CommonPaginationOptions<Data, Variables extends PaginationVariables> {
  variables: NonPaginationVariables<Variables>;
  getPageInfo: (data: Data) => Omit<PageInfo, 'hasPreviousPage'> | undefined;
  pageSize: number;
  firstPageSize?: number;
}

export interface PaginationOptionsNonLazy<Data, Variables extends PaginationVariables>
  extends CommonPaginationOptions<Data, Variables> {
  useQuery: (
    options: QueryHookOptions<Data, Variables> & ({ variables: Variables; skip?: boolean } | { skip: boolean })
  ) => QueryResult<Data, Variables>;
  options?: QueryHookOptions<
    Data,
    NonPaginationVariables<Variables> & ({ variables: Variables; skip?: boolean } | { skip: boolean })
  >;
}

export interface PaginationOptionsLazy<Data, Variables extends PaginationVariables>
  extends CommonPaginationOptions<Data, Variables> {
  useLazyQuery: (options: LazyQueryHookOptions<Data, Variables>) => QueryTuple<Data, Variables>;
  options?: LazyQueryHookOptions<Data, NonPaginationVariables<Variables>>;
}

interface PaginatedQueryProvided<Data> {
  data: Data | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  fetchMore: (itemsNumber?: number) => Promise<void>;
  refetch: () => Promise<unknown>;
  hasMore: undefined | boolean;
  pageSize: number;
  firstPageSize: number;
  loadQuery: () => Promise<void>;
  subscribeToMore?: QueryResult<Data>['subscribeToMore'];
}

const useQuery = <Data, Variables extends PaginationVariables>(
  options: PaginationOptionsNonLazy<Data, Variables> | PaginationOptionsLazy<Data, Variables>
) => {
  const { variables, pageSize, firstPageSize = pageSize } = options;

  if ('useQuery' in options) {
    const { data, loading, error, fetchMore, subscribeToMore, refetch } = options.useQuery({
      ...options.options,
      variables: {
        first: firstPageSize,
        ...variables,
      },
    } as QueryHookOptions<Data, Variables> & ({ variables: Variables; skip?: boolean } | { skip: boolean }));

    return {
      data,
      loading,
      error,
      fetchMore,
      subscribeToMore,
      refetch: () => refetch(variables as Variables),
    };
  } else {
    const [loadQuery, { data, loading, error, fetchMore, subscribeToMore, refetch }] = options.useLazyQuery({
      ...options.options,
      variables: {
        first: firstPageSize,
        ...variables,
      },
    } as LazyQueryHookOptions<Data, Variables>);

    return {
      data,
      loading,
      error,
      fetchMore,
      subscribeToMore,
      refetch: () => refetch(variables as Variables),
      loadQuery,
    };
  }
};

const loadNonLazyQuery = () => Promise.reject(new TypeError('Cannot load non-lazy query.'));

const usePaginatedQuery = <Data, Variables extends PaginationVariables>(
  options: PaginationOptionsNonLazy<Data, Variables> | PaginationOptionsLazy<Data, Variables>
): PaginatedQueryProvided<Data> => {
  const { getPageInfo, pageSize, firstPageSize = pageSize } = options;

  const {
    data,
    loading,
    error,
    fetchMore: fetchMoreRaw,
    subscribeToMore,
    loadQuery: loadQueryRaw = loadNonLazyQuery,
    refetch,
  } = useQuery(options);

  const hasMore = data && getPageInfo(data)?.hasNextPage;

  const fetchMore = useCallback(
    async (itemsNumber = pageSize) => {
      if (!data) {
        return;
      }

      await fetchMoreRaw({
        variables: {
          ...options.variables,
          first: itemsNumber,
          after: getPageInfo(data)?.endCursor,
        },
      });
    },
    [data, fetchMoreRaw, getPageInfo, pageSize]
  );

  const loadQuery = useCallback(async () => {
    await loadQueryRaw();
  }, [loadQueryRaw]);

  return {
    data,
    loading,
    error,
    fetchMore,
    subscribeToMore,
    refetch,
    hasMore,
    pageSize,
    firstPageSize,
    loadQuery,
  };
};

export default usePaginatedQuery;
