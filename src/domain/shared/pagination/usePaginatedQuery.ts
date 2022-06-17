import { QueryHookOptions, QueryResult } from '@apollo/client/react/types/types';
import { PageInfo } from '../../../models/graphql-schema';
import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';

export interface PaginationVariables {
  first: number;
  after?: string;
}

type NonPaginationVariables<Variables extends PaginationVariables> = Omit<Variables, keyof PaginationVariables>;

export interface PaginationOptions<Data, Variables extends PaginationVariables> {
  useQuery: (options: QueryHookOptions<Data, Variables>) => QueryResult<Data, Variables>;
  options?: QueryHookOptions<Data, NonPaginationVariables<Variables>>;
  variables: NonPaginationVariables<Variables>;
  getPageInfo: (data: Data) => Omit<PageInfo, 'hasPreviousPage'> | undefined;
  pageSize: number;
  firstPageSize?: number;
}

export interface Provided<Data> {
  data: Data | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  fetchMore: (itemsNumber?: number) => Promise<void>;
  hasMore: undefined | boolean;
  pageSize: number;
  firstPageSize: number;
}

const usePaginatedQuery = <Data, Variables extends PaginationVariables>(
  options: PaginationOptions<Data, Variables>
): Provided<Data> => {
  const { useQuery, options: queryOptions, variables, getPageInfo, pageSize, firstPageSize = pageSize } = options;

  const {
    data,
    loading,
    error,
    fetchMore: fetchMoreRaw,
  } = useQuery({
    ...queryOptions,
    variables: {
      first: firstPageSize,
      ...variables,
    } as Variables,
  } as QueryHookOptions<Data, Variables>);

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

  return {
    data,
    loading,
    error,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
  };
};

export default usePaginatedQuery;
