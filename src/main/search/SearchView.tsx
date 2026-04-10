import { Box, CircularProgress, Link } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchCategory, SearchResultType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import SearchResultsScope from '@/core/ui/search/SearchResultsScope';
import SearchResultsScopeCard from '@/core/ui/search/SearchResultsScopeCard';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import { buildLoginUrl } from '../routing/urlBuilders';
import AlkemioLogo from '../ui/logo/logoSmall.svg?react';
import {
  contributionFilterConfig,
  contributorFilterConfig,
  FILTER_OFF,
  type FilterConfig,
  type FilterDefinition,
  framingFilterConfig,
} from './Filter';
import SearchResultSection from './SearchResultSection';
import SearchResultPostChooser from './searchResults/SearchResultPostChooser';
import SearchResultsCalloutAndFramingCard from './searchResults/SearchResultsCalloutAndFramingCard';
import SearchCategoriesMenu from './ui/SearchCategoriesMenu';
import { useSearchViewState } from './useSearchViewState';

interface SearchViewProps {
  searchRoute: string;
  spaceFilterConfig: FilterConfig;
  spaceFilterTitle: ReactNode;
}

const SEARCH_RESULTS_COUNT = 4;

const interlaceAndFilterArrays = <T extends { type: SearchResultType }>(
  a: T[] = [],
  b: T[] = [],
  chunkSize: number = SEARCH_RESULTS_COUNT,
  filter?: FilterDefinition
): T[] => {
  const result: T[] = [];
  const maxLength = Math.max(a.length, b.length);

  for (let i = 0; i < maxLength; i += chunkSize) {
    result.push(...a.slice(i, i + chunkSize));
    result.push(...b.slice(i, i + chunkSize));
  }

  if (!filter || filter.typename === FILTER_OFF) {
    return result;
  } else {
    return result.filter(result => filter.value.includes(result.type));
  }
};

const Logo = () => <AlkemioLogo />;

const SearchView = ({ searchRoute, spaceFilterConfig, spaceFilterTitle }: SearchViewProps) => {
  const { t } = useTranslation();

  const {
    data,
    termsFromUrl,
    isAuthenticated,
    isSearching,
    isSearchingForMore,
    hasNoTermsLength,
    spaceId,
    spaceDetails,
    spaceDetailsLoading: loading,
    spaceResults,
    calloutResults,
    framingResults,
    contributionResults,
    contributorResults,
    spaceFilter,
    setSpaceFilter,
    framingFilter,
    setFramingFilter,
    contributionFilter,
    setContributionFilter,
    contributorFilter,
    setContributorFilter,
    canSpaceLoadMore,
    canCalloutLoadMore,
    canFramingLoadMore,
    canContributionLoadMore,
    canContributorLoadMore,
    handleTermsChange,
    handleSearchInPlatform,
    fetchNewResults,
  } = useSearchViewState(searchRoute, spaceFilterConfig);

  const filteredSpaceResults =
    spaceFilter.typename === 'all'
      ? spaceResults
      : spaceResults?.filter(space =>
          spaceFilter.typename === 'space' ? space.type === 'SPACE' : space.type === 'SUBSPACE'
        );

  const filteredCalloutAndFramingResults = interlaceAndFilterArrays(
    calloutResults,
    framingResults,
    SEARCH_RESULTS_COUNT,
    framingFilter // No type filter for callouts
  );

  const filteredContributionResults =
    contributionFilter.typename === 'all'
      ? contributionResults
      : contributionResults?.filter(contribution => {
          switch (contributionFilter.typename) {
            case 'post':
              return contribution.type === SearchResultType.Post;
            case 'memo':
              return contribution.type === SearchResultType.Memo;
            case 'whiteboard':
              return contribution.type === SearchResultType.Whiteboard;
            default:
              return true;
          }
        });

  const filteredContributorResults =
    contributorFilter.typename === 'all'
      ? contributorResults
      : contributorResults?.filter(contributor =>
          contributorFilter.typename === 'user'
            ? contributor.type === SearchResultType.User
            : contributor.type === SearchResultType.Organization
        );

  return (
    <PageContentColumn columns={12}>
      <PageContentBlockSeamless
        disablePadding={true}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#fff',
          marginTop: 0.5,
        }}
      >
        <MultipleSelect size="small" onChange={handleTermsChange} value={termsFromUrl} minLength={2} autoFocus={true} />
      </PageContentBlockSeamless>

      {spaceId && (
        <SearchResultsScope
          currentScope={
            <SearchResultsScopeCard
              avatar={spaceDetails?.lookup.space?.about.profile.avatar}
              iconComponent={SpaceL0Icon}
              loading={loading}
              onDelete={handleSearchInPlatform}
            >
              {spaceDetails?.lookup.space?.about.profile.displayName}
            </SearchResultsScopeCard>
          }
          alternativeScope={
            <SearchResultsScopeCard iconComponent={Logo} onClick={handleSearchInPlatform}>
              {t('components.searchScope.platform')}
            </SearchResultsScopeCard>
          }
        />
      )}

      {!isAuthenticated && (
        <Box display="flex" justifyContent="center" paddingBottom={2}>
          <Link href={buildLoginUrl()}>{t('pages.search.user-not-logged')}</Link>
        </Box>
      )}

      <Gutters disablePadding={true} sx={{ width: '100%', flexDirection: 'row' }}>
        <SearchCategoriesMenu results={data?.search} />

        <Gutters disablePadding={true} sx={{ width: '100%', flexDirection: 'column' }}>
          {isSearching && !isSearchingForMore && !hasNoTermsLength && (
            <Box display="flex" justifyContent="center" alignItems="center" paddingY={4} gap={1}>
              <CircularProgress size={20} />
              <Box component="span" color="primary.main" fontSize="0.875rem">
                {t('pages.search.loading')}
              </Box>
            </Box>
          )}
          {(data?.search?.spaceResults.results?.length ?? 0) > 0 && (
            <SectionWrapper>
              <SearchResultSection
                tagId="spaces"
                title={spaceFilterTitle}
                filterTitle={t('pages.search.filter.type.space')}
                count={data?.search?.spaceResults?.total ?? 0}
                filterConfig={spaceFilterConfig}
                results={filteredSpaceResults}
                currentFilter={spaceFilter}
                onFilterChange={setSpaceFilter}
                loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
                cardComponent={SearchResultPostChooser}
                canLoadMore={canSpaceLoadMore}
                onClickLoadMore={() => fetchNewResults(SearchCategory.Spaces)}
              />
            </SectionWrapper>
          )}
          {((data?.search?.calloutResults.results?.length ?? 0) > 0 ||
            (data?.search?.framingResults.results?.length ?? 0) > 0) && (
            <SectionWrapper>
              <SearchResultSection
                tagId="collaboration-tools"
                title={t('pages.search.filter.key.callout')}
                filterTitle={t('common.type')}
                count={(data?.search?.calloutResults?.total ?? 0) + (data?.search?.framingResults?.total ?? 0)}
                filterConfig={framingFilterConfig}
                results={filteredCalloutAndFramingResults}
                currentFilter={framingFilter}
                onFilterChange={setFramingFilter}
                loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
                cardComponent={SearchResultsCalloutAndFramingCard}
                canLoadMore={canCalloutLoadMore || canFramingLoadMore}
                onClickLoadMore={() =>
                  Promise.all([
                    fetchNewResults(SearchCategory.CollaborationTools),
                    fetchNewResults(SearchCategory.Framings),
                  ])
                }
              />
            </SectionWrapper>
          )}
          {(data?.search?.contributionResults.results?.length ?? 0) > 0 && (
            <SectionWrapper>
              <SearchResultSection
                tagId="contributions"
                title={t('pages.search.filter.key.contribution')}
                filterTitle={t('pages.search.filter.type.contribution')}
                count={data?.search?.contributionResults?.total ?? 0}
                filterConfig={contributionFilterConfig}
                results={filteredContributionResults}
                currentFilter={contributionFilter}
                onFilterChange={setContributionFilter}
                loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
                cardComponent={SearchResultPostChooser}
                canLoadMore={canContributionLoadMore}
                onClickLoadMore={() => fetchNewResults(SearchCategory.Contributions)}
              />
            </SectionWrapper>
          )}
          {(data?.search?.actorResults.results?.length ?? 0) > 0 && (
            <SectionWrapper>
              <SearchResultSection
                tagId="contributors"
                title={t('common.contributors')}
                filterTitle={t('pages.search.filter.type.contributor')}
                count={data?.search?.actorResults?.total ?? 0}
                filterConfig={contributorFilterConfig}
                results={filteredContributorResults}
                currentFilter={contributorFilter}
                onFilterChange={setContributorFilter}
                loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
                cardComponent={SearchResultPostChooser}
                canLoadMore={canContributorLoadMore}
                onClickLoadMore={() => fetchNewResults(SearchCategory.Contributors)}
              />
            </SectionWrapper>
          )}
        </Gutters>
      </Gutters>
    </PageContentColumn>
  );
};

export default SearchView;

function SectionWrapper({ children }: PropsWithChildren) {
  return <Box sx={{ display: 'flex', flexDirection: 'row', gap: gutters(1) }}>{children}</Box>;
}
