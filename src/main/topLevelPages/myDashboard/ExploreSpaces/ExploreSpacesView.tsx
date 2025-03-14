import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { Box, Button, Theme, useMediaQuery } from '@mui/material';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SearchTagsInput from '@/domain/shared/components/SearchTagsInput/SearchTagsInput';
import Gutters from '@/core/ui/grid/Gutters';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { gutters, useGridItem } from '@/core/ui/grid/utils';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import SeeMoreExpandable from '@/core/ui/content/SeeMoreExpandable';
import JourneyTile from '@/domain/journey/common/JourneyTile/JourneyTile';
import { ExploreSpacesViewProps } from './ExploreSpacesTypes';
import { useColumns } from '@/core/ui/grid/GridContext';

const DEFAULT_ITEMS_LIMIT = 15; // 3 rows of 5 but without the welcome space

// Default option not a filter
export enum SpacesExplorerMembershipFilter {
  All = 'all',
}

export const ExploreSpacesView = ({
  spaces,
  searchTerms,
  setSearchTerms,
  setSelectedFilter,
  selectedFilter,
  loading,
  fetchMore,
  hasMore,
  filtersConfig,
  welcomeSpace,
  itemsPerRow = 4,
  itemsLimit = DEFAULT_ITEMS_LIMIT,
}: ExploreSpacesViewProps) => {
  const { t } = useTranslation();

  const columns = useColumns();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  // 2 items on small and full width on mobile; issue with 8 columns on isSmall instead of 12
  const cardColumns = isMobile ? columns : columns / (isSmall ? 2 : 4);

  const [hasExpanded, setHasExpanded] = useState(false);
  const enabledFilters = filtersConfig.flatMap(category => category.key);
  const filterNames = filtersConfig.flatMap(category => category.name);

  const isCollapsed = !hasExpanded;

  const spacesLength = spaces?.length ?? 0;

  const enableLazyLoading = !isCollapsed || spacesLength < itemsLimit;

  const enableShowAll = isCollapsed && (spacesLength > itemsLimit || hasMore);

  const loader = useLazyLoading(Box, { fetchMore, loading, hasMore });

  const visibleSpaces = isCollapsed ? spaces?.slice(0, itemsLimit) : spaces;

  const getGridItemStyle = useGridItem();

  const onFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const renderSkeleton = (size: number) =>
    Array.from({ length: size }).map((_, index) => (
      <JourneyTile key={index} journey={undefined} columns={cardColumns} />
    ));

  const isSearching = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // show the welcome space first in the results if no search terms or filters applied
  const visibleFirstWelcomeSpace = !isSearching && welcomeSpace;

  return (
    <>
      <Gutters row disablePadding maxWidth="100%" alignItems="center">
        <Caption gap={gutters(0.5)} display={'flex'} justifyContent={'center'}>
          <RocketLaunchOutlinedIcon fontSize="small" />
          <span>{t('pages.exploreSpaces.title')}</span>
        </Caption>
      </Gutters>
      <Gutters row disablePadding flexWrap="wrap" justifyContent="center" paddingTop={gutters(0.2)}>
        <SearchTagsInput
          value={searchTerms}
          placeholder={t('pages.exploreSpaces.search.placeholder')}
          onChange={(_event: unknown, newValue: string[]) => setSearchTerms(newValue)}
          fullWidth={false}
          sx={{ flexGrow: 1, flexBasis: getGridItemStyle(3).width }}
        />
        <Gutters row disablePadding maxWidth="100%" alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Button
            variant={SpacesExplorerMembershipFilter.All === selectedFilter ? 'contained' : 'outlined'}
            sx={{ textTransform: 'none', flexShrink: 1 }}
            onClick={() => onFilterChange(SpacesExplorerMembershipFilter.All)}
          >
            <Caption noWrap>{t('pages.exploreSpaces.activeSpacesFilter')}</Caption>
          </Button>
          {enabledFilters.map((filter, i) => (
            <Button
              key={filter}
              variant={filter === selectedFilter ? 'contained' : 'outlined'}
              sx={{ textTransform: 'none', flexShrink: 1 }}
              onClick={() => onFilterChange(filter)}
            >
              <Caption noWrap>{filterNames[i]}</Caption>
            </Button>
          ))}
        </Gutters>
      </Gutters>
      {searchTerms.length !== 0 && spacesLength === 0 && (
        <CaptionSmall marginX="auto" paddingY={gutters()}>
          {t('pages.exploreSpaces.search.noResults')}
        </CaptionSmall>
      )}
      <ScrollableCardsLayoutContainer orientation="vertical">
        {visibleFirstWelcomeSpace && <JourneyTile journey={welcomeSpace} columns={cardColumns} />}
        {spacesLength > 0 && (
          <>
            {visibleSpaces!.map(space =>
              visibleFirstWelcomeSpace && space.id === welcomeSpace?.id ? null : (
                <JourneyTile key={space.id} journey={space} columns={cardColumns} />
              )
            )}
            {enableLazyLoading && loader}
          </>
        )}
        {loading && renderSkeleton(itemsPerRow)}
      </ScrollableCardsLayoutContainer>
      {enableShowAll && (
        <SeeMoreExpandable onExpand={() => setHasExpanded(true)} label={t('pages.exploreSpaces.seeAll')} />
      )}
    </>
  );
};
