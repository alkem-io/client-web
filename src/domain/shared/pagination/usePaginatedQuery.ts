import { LazyQueryHookOptions, QueryHookOptions, QueryResult, QueryTuple } from '@apollo/client/react/types/types';
import { PageInfo } from '../../../models/graphql-schema';
import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';

export interface PaginationVariables {
  first: number;
  after?: string;
}

export type NonPaginationVariables<Variables extends PaginationVariables> = Omit<Variables, 'first'>;

interface CommonPaginationOptions<Data, Variables extends PaginationVariables> {
  variables: NonPaginationVariables<Variables>;
  getPageInfo: (data: Data) => Omit<PageInfo, 'hasPreviousPage'> | undefined;
  pageSize: number;
  firstPageSize?: number;
}

export interface PaginationOptionsNonLazy<Data, Variables extends PaginationVariables>
  extends CommonPaginationOptions<Data, Variables> {
  useQuery: (options: QueryHookOptions<Data, Variables>) => QueryResult<Data, Variables>;
  options?: QueryHookOptions<Data, NonPaginationVariables<Variables>>;
}

export interface PaginationOptionsLazy<Data, Variables extends PaginationVariables>
  extends CommonPaginationOptions<Data, Variables> {
  useLazyQuery: (options: LazyQueryHookOptions<Data, Variables>) => QueryTuple<Data, Variables>;
  options?: LazyQueryHookOptions<Data, NonPaginationVariables<Variables>>;
}

export interface Provided<Data> {
  data: Data | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  fetchMore: (itemsNumber?: number) => Promise<void>;
  hasMore: undefined | boolean;
  pageSize: number;
  firstPageSize: number;
  loadQuery: () => Promise<void>;
}

const useQuery = <Data, Variables extends PaginationVariables>(
  options: PaginationOptionsNonLazy<Data, Variables> | PaginationOptionsLazy<Data, Variables>
) => {
  const { variables, pageSize, firstPageSize = pageSize } = options;

  if ('useQuery' in options) {
    const { data, loading, error, fetchMore } = options.useQuery({
      ...options.options,
      variables: {
        first: firstPageSize,
        ...variables,
      },
    } as QueryHookOptions<Data, Variables>);

    return {
      data,
      loading,
      error,
      fetchMore,
    };
  } else {
    const [loadQuery, { data, loading, error, fetchMore }] = options.useLazyQuery({
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
      loadQuery,
    };
  }
};

const loadNonLazyQuery = () => Promise.reject(new TypeError('Cannot load non-lazy query.'));

const usePaginatedQuery = <Data, Variables extends PaginationVariables>(
  options: PaginationOptionsNonLazy<Data, Variables> | PaginationOptionsLazy<Data, Variables>
): Provided<Data> => {
  const { getPageInfo, pageSize, firstPageSize = pageSize } = options;

  const {
    data,
    loading,
    error,
    fetchMore: fetchMoreRaw,
    loadQuery: loadQueryRaw = loadNonLazyQuery,
  } = useQuery(options);

  const hasMore = data && getPageInfo(data)?.hasNextPage;

  const fetchMore = useCallback(
    async (itemsNumber = pageSize) => {
      if (!data) {
        return;
      }

      await fetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: getPageInfo(data)?.endCursor,
        },
      });
    },
    [data, fetchMoreRaw]
  );

  const loadQuery = useCallback(async () => {
    await loadQueryRaw();
  }, [loadQueryRaw]);

  return {
    data,
    loading,
    error,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
    loadQuery,
  };
};

export default usePaginatedQuery;
