import { useAvailableOrganizationsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { Identifiable } from '@/core/utils/Identifiable';
import { AVAILABLE_USERS_PAGE_SIZE, type AvailableOrganizationsResponse } from './common';

type useRoleSetAvailableOrganizationsOnPlatformParams = {
  organizationsAlreadyInRole?: Identifiable[];
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAvailableOrganizationsOnPlatformProvided extends AvailableOrganizationsResponse {}

/**
 * @internal
 * Do not use this hook directly, normally you should use useRoleSetAvailableOrganizations instead.
 * Mirrors `useRoleSetAvailableUsersOnPlatform` for the organization holder-kind (FR-002/SC-009):
 * the 3 `Feature …` roles are grantable to an organization as well as a user.
 */
const useRoleSetAvailableOrganizationsOnPlatform = ({
  organizationsAlreadyInRole,
  filter,
  skip,
}: useRoleSetAvailableOrganizationsOnPlatformParams): useRoleSetAvailableOrganizationsOnPlatformProvided => {
  const {
    data,
    loading,
    fetchMore: fetchMoreRaw,
    refetch,
  } = useAvailableOrganizationsQuery({
    variables: {
      first: AVAILABLE_USERS_PAGE_SIZE,
      filter: { displayName: filter },
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    skip,
  });

  const pageInfo = data?.organizationsPaginated.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;

  const fetchMore = async (itemsNumber = AVAILABLE_USERS_PAGE_SIZE) => {
    if (!data) {
      return;
    }

    await fetchMoreRaw({
      variables: {
        first: itemsNumber,
        after: pageInfo?.endCursor,
        filter: { displayName: filter },
      },
    });
  };

  const firstPage = data?.organizationsPaginated;
  const organizations = (() => {
    if (!firstPage?.organization) {
      return [];
    }
    if (!organizationsAlreadyInRole) {
      return firstPage.organization;
    }
    return firstPage.organization.filter(
      organization => !organizationsAlreadyInRole?.find(current => current.id === organization.id)
    );
  })();

  return {
    organizations,
    hasMore,
    fetchMore,
    refetch,
    loading,
  };
};

export default useRoleSetAvailableOrganizationsOnPlatform;
