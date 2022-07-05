import { Dispatch, useState } from 'react';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';
import { useAllOrganizationsLazyQuery } from '../../../hooks/generated/graphql';
import { Provided as UsePaginatedQueryProvided } from '../../shared/pagination/usePaginatedQuery';
import { AllOrganizationsQuery, OrganizationDetailsFragment } from '../../../models/graphql-schema';

const AVAILABLE_ORGANIZATIONS_PER_PAGE = 10;

export interface Provided extends Omit<UsePaginatedQueryProvided<AllOrganizationsQuery>, 'data' | 'loadQuery'> {
  allPossibleOrganizations: OrganizationDetailsFragment[] | undefined;
  searchTerm: string;
  onSearchTermChange: Dispatch<string>;
  loadAvailableMembers: () => Promise<void>;
}

const useAllPossibleOrganizations = (): Provided => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: allOrganizationsQueryData,
    loadQuery,
    ...paginationProvided
  } = usePaginatedQuery({
    useLazyQuery: useAllOrganizationsLazyQuery,
    pageSize: AVAILABLE_ORGANIZATIONS_PER_PAGE,
    variables: {
      filter: {
        displayName: searchTerm,
      },
    },
    getPageInfo: data => data?.organizationsPaginated.pageInfo,
  });

  return {
    ...paginationProvided,
    allPossibleOrganizations: allOrganizationsQueryData?.organizationsPaginated.organization,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    loadAvailableMembers: loadQuery,
  };
};

export default useAllPossibleOrganizations;
