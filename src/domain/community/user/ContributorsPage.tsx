import { useState, ChangeEvent, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { useCurrentUserContext } from '../userCurrent/useCurrentUserContext';
import ContributorsView, { ITEMS_PER_PAGE } from './ContributorsView';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { GroupOutlined } from '@mui/icons-material';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import {
  useContributorsPageOrganizationsQuery,
  useContributorsPageUsersQuery,
  useContributorsVirtualInLibraryQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  OrganizationContributorFragment,
  OrganizationVerificationEnum,
  UserContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import { arrayShuffle } from '@/core/utils/array.shuffle';
import { VirtualContributorModelBase } from '../virtualContributor/model/VirtualContributorModelBase';
import { ApolloError } from '@apollo/client';

export interface VirtualContributors {
  items: VirtualContributorModelBase[] | undefined;
  loading: boolean;
}

export interface PaginatedResult<T> {
  items: T[] | undefined;
  hasMore: boolean | undefined;
  pageSize: number;
  firstPageSize: number;
  loading: boolean;
  error?: ApolloError;
  fetchMore: (itemsNumber?: number) => Promise<void>;
}

const ContributorsPage = () => {
  const { t } = useTranslation();

  // temporary disable the search (server #4545)
  const [searchEnabled] = useState(false);

  const [searchTerms, setSearchTerms] = useState('');

  const [searchTermsDebounced, setSearchTermsDebounced] = useState('');

  const { isAuthenticated } = useCurrentUserContext();

  const pageSize = ITEMS_PER_PAGE;

  const onSearchHandlerDebounced = debounce((value: string) => setSearchTermsDebounced(value), 500);

  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerms(e.target.value);
    onSearchHandlerDebounced(e.target.value);
  };

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.contributors' });

  // Call the query hook directly instead of passing it to usePaginatedQuery
  const {
    data: usersData,
    loading: usersLoading,
    fetchMore: usersFetchMoreRaw,
    error: usersError,
  } = useContributorsPageUsersQuery({
    variables: {
      first: pageSize,
      withTags: true,
      filter: { firstName: searchTermsDebounced, lastName: searchTermsDebounced, email: searchTermsDebounced },
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    skip: !isAuthenticated,
  });

  const usersPageInfo = usersData?.usersPaginated.pageInfo;
  const usersHasMore = usersPageInfo?.hasNextPage ?? false;

  const usersFetchMore = useCallback(
    async (itemsNumber = pageSize) => {
      if (!usersData) {
        return;
      }

      await usersFetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: usersPageInfo?.endCursor,
          withTags: true,
          filter: { firstName: searchTermsDebounced, lastName: searchTermsDebounced, email: searchTermsDebounced },
        },
      });
    },
    [usersData, usersFetchMoreRaw, usersPageInfo?.endCursor, pageSize, searchTermsDebounced]
  );

  const randomizedUsers = useMemo(() => {
    // if the length changed, shuffle only the new portion of the array
    // to avoid re-rendering the entire list
    const users = usersData?.usersPaginated.users;

    if (!users) {
      return [];
    }

    const randomizedNewUsers = arrayShuffle(users.slice(-pageSize));

    return [...users.slice(0, users.length - pageSize), ...randomizedNewUsers];
  }, [usersData?.usersPaginated.users?.length, pageSize]);

  const users: PaginatedResult<UserContributorFragment> = {
    items: randomizedUsers,
    loading: usersLoading,
    hasMore: usersHasMore,
    pageSize: pageSize,
    firstPageSize: pageSize,
    error: usersError,
    fetchMore: usersFetchMore,
  };

  // Call organizations query hook directly
  const {
    data: organizationsData,
    loading: organizationsLoading,
    fetchMore: organizationsFetchMoreRaw,
    error: organizationsError,
  } = useContributorsPageOrganizationsQuery({
    variables: {
      first: pageSize,
      status: OrganizationVerificationEnum.VerifiedManualAttestation,
      filter: {
        contactEmail: searchTerms,
        displayName: searchTerms,
        domain: searchTerms,
        nameID: searchTerms,
        website: searchTerms,
      },
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const organizationsPageInfo = organizationsData?.organizationsPaginated.pageInfo;
  const organizationsHasMore = organizationsPageInfo?.hasNextPage ?? false;

  const organizationsFetchMore = useCallback(
    async (itemsNumber = pageSize) => {
      if (!organizationsData) {
        return;
      }

      await organizationsFetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: organizationsPageInfo?.endCursor,
          status: OrganizationVerificationEnum.VerifiedManualAttestation,
          filter: {
            contactEmail: searchTerms,
            displayName: searchTerms,
            domain: searchTerms,
            nameID: searchTerms,
            website: searchTerms,
          },
        },
      });
    },
    [
      organizationsData,
      organizationsFetchMoreRaw,
      organizationsPageInfo?.endCursor,
      pageSize,
      searchTerms,
      OrganizationVerificationEnum.VerifiedManualAttestation,
    ]
  );

  const organizations: PaginatedResult<OrganizationContributorFragment> = {
    items: organizationsData?.organizationsPaginated.organization,
    loading: organizationsLoading,
    hasMore: organizationsHasMore,
    pageSize: pageSize,
    firstPageSize: pageSize,
    error: organizationsError,
    fetchMore: organizationsFetchMore,
  };

  const { data: vcData, loading: loadingVCs } = useContributorsVirtualInLibraryQuery();

  const virtualContributors = {
    items: vcData?.platform.library.virtualContributors ?? [],
    loading: loadingVCs,
  };

  return (
    <TopLevelPageLayout
      title={t('pages.contributors.search.title')}
      subtitle={t('pages.contributors.search.subtitle')}
      iconComponent={GroupOutlined}
      ribbon={ribbon}
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
    >
      <PageContentColumn columns={12}>
        {searchEnabled && (
          <PageContentBlockSeamless disablePadding>
            <OutlinedInput
              value={searchTerms}
              sx={{ width: '100%' }}
              placeholder={t('components.searchableList.placeholder')}
              onChange={onSearchHandler}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </PageContentBlockSeamless>
        )}
        <ContributorsView
          usersPaginated={users}
          showUsers={isAuthenticated}
          organizationsPaginated={organizations}
          virtualContributors={virtualContributors}
        />
      </PageContentColumn>
    </TopLevelPageLayout>
  );
};

export default ContributorsPage;
