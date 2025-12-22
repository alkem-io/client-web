import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { Box, Button } from '@mui/material';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SearchTagsInput from '@/domain/shared/components/SearchTagsInput/SearchTagsInput';
import Gutters from '@/core/ui/grid/Gutters';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { gutters, useGridItem } from '@/core/ui/grid/utils';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import SeeMoreExpandable from '@/core/ui/content/SeeMoreExpandable';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { ExploreSpacesViewProps, SpaceWithParent } from './ExploreSpacesTypes';
import { collectParentAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { Lead, LeadOrganization, LeadType } from '@/domain/space/components/cards/components/SpaceLeads';

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
  const { isAuthenticated } = useCurrentUserContext();

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

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleContactLead = useCallback(
    (leadType: LeadType, leadId: string, leadDisplayName: string, leadAvatarUri?: string) => {
      sendMessage(leadType, {
        id: leadId,
        displayName: leadDisplayName,
        avatarUri: leadAvatarUri,
      });
    },
    [sendMessage]
  );

  const renderSpaceCard = (space: SpaceWithParent | undefined) => {
    if (!space) {
      return <SpaceCard displayName="" tagline="" spaceId="" key={Math.random()} />;
    }

    const membershipWithLeads = space.about.membership as typeof space.about.membership & {
      leadUsers?: Lead[];
      leadOrganizations?: LeadOrganization[];
    };

    return (
      <SpaceCard
        key={space.id}
        spaceId={space.id}
        displayName={space.about.profile.displayName}
        tagline={space.about.profile.tagline ?? ''}
        banner={space.about.profile.cardBanner}
        tags={space.about.profile.tagset?.tags}
        spaceUri={space.about.profile.url}
        level={space.level}
        member={space.about.membership?.myMembershipStatus === CommunityMembershipStatus.Member}
        isPrivate={!space.about.isContentPublic}
        avatarUris={collectParentAvatars(space)}
        leadUsers={membershipWithLeads?.leadUsers}
        leadOrganizations={membershipWithLeads?.leadOrganizations}
        showLeads={isAuthenticated}
        onContactLead={handleContactLead}
      />
    );
  };

  const renderSkeleton = (size: number) => Array.from({ length: size }).map(() => renderSpaceCard(undefined));

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
        {visibleFirstWelcomeSpace && renderSpaceCard(welcomeSpace)}
        {spacesLength > 0 && (
          <>
            {visibleSpaces!.map(space =>
              visibleFirstWelcomeSpace && space.id === welcomeSpace?.id ? null : renderSpaceCard(space)
            )}
            {enableLazyLoading && loader}
          </>
        )}
        {loading && renderSkeleton(itemsPerRow)}
      </ScrollableCardsLayoutContainer>
      {enableShowAll && (
        <SeeMoreExpandable onExpand={() => setHasExpanded(true)} label={t('pages.exploreSpaces.seeAll')} />
      )}
      {directMessageDialog}
    </>
  );
};
