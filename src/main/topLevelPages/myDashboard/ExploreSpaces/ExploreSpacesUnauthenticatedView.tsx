import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Caption, CaptionSmall } from '../../../../core/ui/typography';
import { Box, Button } from '@mui/material';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchTagsInput from '../../../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import Gutters from '../../../../core/ui/grid/Gutters';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { Visual } from '../../../../domain/common/visual/Visual';
import { gutters, useGridItem } from '../../../../core/ui/grid/utils';
import useLazyLoading from '../../../../domain/shared/pagination/useLazyLoading';
import SeeMoreExpandable from '../../../../core/ui/content/SeeMoreExpandable';
import { Link } from 'react-router-dom';
import { AUTH_SIGN_UP_PATH } from '../../../../core/auth/authentication/constants/authentication.constants';
import { Actions } from '../../../../core/ui/actions/Actions';
import JourneyTile from '../../../../domain/journey/common/JourneyTile/JourneyTile';

export interface ExploreSpacesUnauthenticatedViewProps {
  spaces: SpaceWithParent[] | undefined;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedFilter: string;
  searchTerms: string[];
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => Promise<void>;
  filtersConfig: {
    key: string;
    name: string;
  }[];
  welcomeSpace?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      cardBanner?: Visual;
    };
  };
}

// Default option not a filer
export enum SpacesExplorerMembershipFilter {
  All = 'all',
}

export type SpaceWithParent = Space & WithParent<ParentSpace>;

interface ParentSpace extends Identifiable {
  profile: {
    displayName: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
}

type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

interface Space extends Identifiable {
  profile: {
    url: string;
    displayName: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
}

export const ITEMS_LIMIT = 15; // 3 rows of 5 but without the welcome space

export const ExploreSpacesUnauthenticatedView: FC<ExploreSpacesUnauthenticatedViewProps> = ({
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
}) => {
  const { t } = useTranslation();

  const [hasExpanded, setHasExpanded] = useState(false);
  const enabledFilters = filtersConfig.flatMap(category => category.key);
  const filterNames = filtersConfig.flatMap(category => category.name);

  const isCollapsed = !hasExpanded;

  const enableLazyLoading = !isCollapsed || (spaces && spaces.length < ITEMS_LIMIT);

  const enableShowAll = isCollapsed && spaces && (spaces.length > ITEMS_LIMIT || hasMore);

  const loader = useLazyLoading(Box, { fetchMore, loading, hasMore });

  const visibleSpaces = isCollapsed ? spaces?.slice(0, ITEMS_LIMIT) : spaces;

  const getGridItemStyle = useGridItem();

  const onFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const renderSkeleton = (size: number) =>
    Array.from({ length: size }).map((_, index) => (
      <JourneyTile key={index} journey={undefined} journeyTypeName="space" />
    ));

  const isSearching = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // show the welcome space first in the results if no search terms or filters applied
  const visibleFirstWelcomeSpace = !isSearching && welcomeSpace;

  return (
    <PageContentBlock>
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
      {searchTerms.length !== 0 && spaces && spaces.length === 0 && (
        <CaptionSmall marginX="auto" paddingY={gutters()}>
          {t('pages.exploreSpaces.search.noResults')}
        </CaptionSmall>
      )}
      <ScrollableCardsLayoutContainer>
        {visibleFirstWelcomeSpace && <JourneyTile journey={welcomeSpace} journeyTypeName="space" />}
        {spaces && spaces.length > 0 && (
          <>
            {visibleSpaces!.map(space =>
              visibleFirstWelcomeSpace && space.id === welcomeSpace?.id ? null : (
                <JourneyTile key={space.id} journey={space} journeyTypeName="space" />
              )
            )}
            {enableLazyLoading && loader}
          </>
        )}
        {loading && renderSkeleton(5)}
      </ScrollableCardsLayoutContainer>
      {enableShowAll && (
        <SeeMoreExpandable onExpand={() => setHasExpanded(true)} label={t('pages.exploreSpaces.seeAll')} />
      )}
      <Actions justifyContent={'center'}>
        <Button
          component={Link}
          to={AUTH_SIGN_UP_PATH}
          variant="contained"
          size="large"
          sx={{ width: 'auto', textTransform: 'none', a: { textDecoration: 'underline' } }}
          startIcon={<AccountCircleOutlinedIcon />}
        >
          {t('authentication.sign-up')}
        </Button>
      </Actions>
    </PageContentBlock>
  );
};
