import {
  useContributorsPageOrganizationsQuery,
  useContributorsPageUsersQuery,
  useContributorsVirtualInLibraryQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ContributorsPageOrganizationsQuery,
  ContributorsPageOrganizationsQueryVariables,
  ContributorsPageUsersQuery,
  ContributorsPageUsersQueryVariables,
  OrganizationContributorFragment,
  OrganizationVerificationEnum,
  Tagset,
  UserContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import { ContainerChildProps } from '@/core/container/container';
import { arrayShuffle } from '@/core/utils/array.shuffle';
import { useUserContext } from '@/domain/community/user';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { ApolloError } from '@apollo/client';
import { useMemo } from 'react';

export interface PaginatedResult<T> {
  items: T[] | undefined;
  hasMore: boolean | undefined;
  pageSize: number;
  firstPageSize: number;
  loading: boolean;
  error?: ApolloError;
  fetchMore: (itemsNumber?: number) => Promise<void>;
}

export type VirtualContributor = {
  id: string;
  profile: {
    displayName: string;
    url: string;
    tagsets?: Tagset[];
    location?: {
      city?: string;
      country?: string;
    };
    avatar?: {
      uri: string;
    } | null;
  };
};

export interface VirtualContributors {
  items: VirtualContributor[] | undefined;
  loading: boolean;
}

export interface ContributorsSearchContainerEntities {
  users: PaginatedResult<UserContributorFragment> | undefined;
  organizations: PaginatedResult<OrganizationContributorFragment> | undefined;
  virtualContributors: VirtualContributors | undefined;
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

const ContributorsSearchContainer = ({ searchTerms, pageSize, children }: ContributorsSearchContainerProps) => {
  const { isAuthenticated } = useUserContext();

  const usersQueryResult = usePaginatedQuery<ContributorsPageUsersQuery, ContributorsPageUsersQueryVariables>({
    useQuery: useContributorsPageUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: !isAuthenticated,
    },
    variables: {
      withTags: true,
      filter: { firstName: searchTerms, lastName: searchTerms, email: searchTerms },
    },
    pageSize: pageSize,
    getPageInfo: result => result.usersPaginated.pageInfo,
  });

  const randomizedUsers = useMemo(() => {
    // if the length changed, shuffle only the new portion of the array
    // to avoid re-rendering the entire list
    const users = usersQueryResult.data?.usersPaginated.users;

    if (!users) {
      return [];
    }

    const randomizedNewUsers = arrayShuffle(users.slice(-pageSize));

    return [...users.slice(0, users.length - pageSize), ...randomizedNewUsers];
  }, [usersQueryResult.data?.usersPaginated.users?.length]);

  const users: PaginatedResult<UserContributorFragment> = {
    items: randomizedUsers,
    loading: usersQueryResult.loading,
    hasMore: usersQueryResult.hasMore,
    pageSize: usersQueryResult.pageSize,
    firstPageSize: usersQueryResult.firstPageSize,
    error: usersQueryResult.error,
    fetchMore: usersQueryResult.fetchMore,
  };

  const organizationsQueryResult = usePaginatedQuery<
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
    items: organizationsQueryResult.data?.organizationsPaginated.organization,
    loading: organizationsQueryResult.loading,
    hasMore: organizationsQueryResult.hasMore,
    pageSize: organizationsQueryResult.pageSize,
    firstPageSize: organizationsQueryResult.firstPageSize,
    error: organizationsQueryResult.error,
    fetchMore: organizationsQueryResult.fetchMore,
  };

  const { data: vcData, loading: loadingVCs } = useContributorsVirtualInLibraryQuery();

  const virtualContributors = {
    items: vcData?.platform.library.virtualContributors ?? [],
    loading: loadingVCs,
  };

  const loading = users.loading || organizations.loading || virtualContributors.loading;
  const error = users.error || organizations.error;
  return <>{children({ users, organizations, virtualContributors }, { loading, error }, {})}</>;
};

export default ContributorsSearchContainer;
