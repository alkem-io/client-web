import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  useContributorsPageOrganizationsQuery,
  useContributorsPageUsersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../user';
import {
  ContributorsPageOrganizationsQuery,
  ContributorsPageOrganizationsQueryVariables,
  ContributorsPageUsersQuery,
  ContributorsPageUsersQueryVariables,
  OrganizationContributorFragment,
  OrganizationVerificationEnum,
  UserContributorFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';

export interface PaginatedResult<T> {
  items: T[] | undefined;
  hasMore: boolean | undefined;
  pageSize: number;
  firstPageSize: number;
  loading: boolean;
  error?: ApolloError;
  fetchMore: (itemsNumber?: number) => Promise<void>;
}

export interface ContributorsSearchContainerEntities {
  users: PaginatedResult<UserContributorFragment> | undefined;
  organizations: PaginatedResult<OrganizationContributorFragment> | undefined;
}

export interface ContributorsSearchContainerActions {}

export interface ContributorsSearchContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ContributorsSearchContainerProps
  extends ContainerChildProps<
    ContributorsSearchContainerEntities,
    ContributorsSearchContainerActions,
    ContributorsSearchContainerState
  > {
  searchTerms: string;
  pageSize: number;
}

const ContributorsSearchContainer: FC<ContributorsSearchContainerProps> = ({ searchTerms, pageSize, children }) => {
  const { isAuthenticated } = useUserContext();

  const usersQueryResult = usePaginatedQuery<ContributorsPageUsersQuery, ContributorsPageUsersQueryVariables>({
    useQuery: useContributorsPageUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: !isAuthenticated,
    },
    variables: {
      filter: { firstName: searchTerms, lastName: searchTerms, email: searchTerms },
    },
    pageSize: pageSize,
    getPageInfo: result => result.usersPaginated.pageInfo,
  });

  const users: PaginatedResult<UserContributorFragment> = {
    items: usersQueryResult.data?.usersPaginated.users,
    loading: usersQueryResult.loading,
    hasMore: usersQueryResult.hasMore,
    pageSize: usersQueryResult.pageSize,
    firstPageSize: usersQueryResult.firstPageSize,
    error: usersQueryResult.error,
    fetchMore: usersQueryResult.fetchMore,
  };

  const oragnizationsQueryResult = usePaginatedQuery<
    ContributorsPageOrganizationsQuery,
    ContributorsPageOrganizationsQueryVariables
  >({
    useQuery: useContributorsPageOrganizationsQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
    },
    variables: {
      status: OrganizationVerificationEnum.VerifiedManualAttestation,
      filter: {
        contactEmail: searchTerms,
        displayName: searchTerms,
        domain: searchTerms,
        nameID: searchTerms,
        website: searchTerms,
      },
    },
    pageSize: pageSize,
    getPageInfo: result => result.organizationsPaginated.pageInfo,
  });

  const organizations: PaginatedResult<OrganizationContributorFragment> = {
    items: oragnizationsQueryResult.data?.organizationsPaginated.organization,
    loading: oragnizationsQueryResult.loading,
    hasMore: oragnizationsQueryResult.hasMore,
    pageSize: oragnizationsQueryResult.pageSize,
    firstPageSize: oragnizationsQueryResult.firstPageSize,
    error: oragnizationsQueryResult.error,
    fetchMore: oragnizationsQueryResult.fetchMore,
  };

  const loading = users.loading || organizations.loading;
  const error = users.error || organizations.error;
  return <>{children({ users, organizations }, { loading, error }, {})}</>;
};

export default ContributorsSearchContainer;
