import { useState, ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { useUserContext } from './';
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
  ContributorsPageOrganizationsQuery,
  ContributorsPageOrganizationsQueryVariables,
  ContributorsPageUsersQuery,
  ContributorsPageUsersQueryVariables,
  OrganizationContributorFragment,
  OrganizationVerificationEnum,
  UserContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import { arrayShuffle } from '@/core/utils/array.shuffle';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { VirtualContributorModelBase } from '../virtualContributor/model/virtual.contributor.base.model';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTermsDebounced, setSearchTermsDebounced] = useState('');

  const { isAuthenticated } = useUserContext();

  const pageSize = ITEMS_PER_PAGE;

  const onSearchHandlerDebounced = debounce((value: string) => setSearchTermsDebounced(value), 500);

  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerms(e.target.value);
    onSearchHandlerDebounced(e.target.value);
  };

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.contributors' });

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
