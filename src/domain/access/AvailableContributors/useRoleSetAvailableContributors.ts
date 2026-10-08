import { useAvailableOrganizationsLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import type { Identifiable } from '@/core/utils/Identifiable';
import { AVAILABLE_CONTRIBUTORS_PAGE_SIZE, type AvailableOrganizationsResponse } from './common';

type useRoleSetAvailableContributorsParams = {
  roleSetId: string | undefined;
  filterCurrentMembers?: Identifiable[];
};

interface useRoleSetAvailableContributorsProvided {
  findAvailableOrganizationsForRoleSet: (filter?: string) => Promise<AvailableOrganizationsResponse>;
}

const buildOrganizationFilterObject = (filter: string | undefined) =>
  filter
    ? {
        displayName: filter,
      }
    : undefined;

const filterExisting = (currentMembers: Identifiable[]) => (contributor: Identifiable) =>
  !currentMembers.some(member => member.id === contributor.id);

const useRoleSetAvailableContributors = ({
  roleSetId,
  filterCurrentMembers = [],
}: useRoleSetAvailableContributorsParams): useRoleSetAvailableContributorsProvided => {
  const [fetchAvailableOrganizationsForRoleSet] = useAvailableOrganizationsLazyQuery();
  const findAvailableOrganizationsForRoleSet = async (filterString: string | undefined) => {
    if (!roleSetId) {
      throw new Error('roleSetId is required');
    }
    const filter = buildOrganizationFilterObject(filterString);
    const { data, fetchMore, refetch, loading } = await fetchAvailableOrganizationsForRoleSet({
      variables: {
        first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
        filter: filter,
      },
    });
    return {
      organizations: data?.organizationsPaginated.organization.filter(filterExisting(filterCurrentMembers)) ?? [],
      hasMore: data?.organizationsPaginated.pageInfo.hasNextPage ?? false,
      refetch,
      loading,
      fetchMore: () =>
        fetchMore({
          variables: {
            roleSetId,
            first: AVAILABLE_CONTRIBUTORS_PAGE_SIZE,
            after: data?.organizationsPaginated.pageInfo.endCursor,
            filter,
          },
        }),
    };
  };

  return { findAvailableOrganizationsForRoleSet };
};

export default useRoleSetAvailableContributors;
