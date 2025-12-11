import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Box, Button, DialogContent, IconButton } from '@mui/material';
import SearchTagsInput from '@/domain/shared/components/SearchTagsInput/SearchTagsInput';
import Gutters from '@/core/ui/grid/Gutters';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { Lead, LeadOrganization } from '@/domain/space/components/cards/components/SpaceLeads';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Visual } from '@/domain/common/visual/Visual';
import { gutters, useGridItem } from '@/core/ui/grid/utils';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import SeeMoreExpandable from '@/core/ui/content/SeeMoreExpandable';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import RouterLink from '@/core/ui/link/RouterLink';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { compact } from 'lodash';
import Loading from '@/core/ui/loading/Loading';
import { useSpaceExplorerWelcomeSpaceQuery, useSpaceUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { collectParentAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
export interface SpaceExplorerViewProps {
  spaces: SpaceWithParent[] | undefined;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  membershipFilter: SpacesExplorerMembershipFilter;
  searchTerms: string[];
  onMembershipFilterChange?: (filter: SpacesExplorerMembershipFilter) => void;
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => Promise<void>;
  authenticated: boolean;
  loadingSearchResults?: boolean | null;
}

export enum SpacesExplorerMembershipFilter {
  All = 'all',
  Member = 'member',
  Public = 'public',
}

export type SpaceWithParent = Space & WithParent<ParentSpace>;

interface ParentSpace extends Identifiable {
  level: SpaceLevel;
  about: {
    profile: {
      displayName: string;
      avatar?: Visual;
      cardBanner?: Visual;
      url: string;
    };
  };
}

type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

interface Space extends Identifiable {
  level: SpaceLevel;
  about: SpaceAboutLightModel;
  matchedTerms?: string[];
}

export const ITEMS_LIMIT = 10;

export const SpaceExplorerView = ({
  spaces,
  searchTerms,
  setSearchTerms,
  membershipFilter,
  loading,
  onMembershipFilterChange,
  fetchMore,
  hasMore,
  authenticated,
  loadingSearchResults = null,
}: SpaceExplorerViewProps) => {
  const { t } = useTranslation();
  const spaceNameId = t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId');
  const { data: spaceIdData } = useSpaceUrlResolverQuery({
    variables: { spaceNameId: spaceNameId },
    skip: !spaceNameId,
  });
  const welcomeSpaceId = spaceIdData?.lookupByName.space?.id;

  const { data: spaceExplorerData } = useSpaceExplorerWelcomeSpaceQuery({
    variables: { spaceId: welcomeSpaceId! },
    skip: !welcomeSpaceId,
  });
  const welcomeSpace = spaceExplorerData?.lookup.space;

  const [hasExpanded, setHasExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const enabledFilters = useMemo(
    () =>
      compact([
        SpacesExplorerMembershipFilter.All,
        authenticated ? SpacesExplorerMembershipFilter.Member : undefined,
        SpacesExplorerMembershipFilter.Public,
      ]),
    [authenticated]
  );

  const isCollapsed = !hasExpanded && membershipFilter !== SpacesExplorerMembershipFilter.Member;

  const enableLazyLoading = !isCollapsed || (spaces && spaces.length < ITEMS_LIMIT);

  const enableShowAll = isCollapsed && spaces && (spaces.length > ITEMS_LIMIT || hasMore);

  const loader = useLazyLoading(Box, { fetchMore, loading, hasMore });

  const shouldDisplayPrivacyInfo = membershipFilter !== SpacesExplorerMembershipFilter.Member;

  const visibleSpaces = isCollapsed ? spaces?.slice(0, ITEMS_LIMIT) : spaces;

  const hasNoMemberSpaces =
    (membershipFilter === SpacesExplorerMembershipFilter.Member && !authenticated) || spaces?.length === 0;

  const renderVisibleSpaces = useCallback(() => {
    const vs: React.ReactElement[] = [];

    if (!visibleSpaces) {
      return vs;
    }

    visibleSpaces.forEach(space => {
      if (!space) {
        return;
      }
      const { id, level, about } = space;

      const { profile, isContentPublic, membership } = about;

      // TypeScript doesn't know that membership has leadUsers/leadOrganizations
      // but the actual GraphQL fragment SpaceExplorerSpace includes them
      const membershipWithLeads = membership as typeof membership & {
        leadUsers?: Lead[];
        leadOrganizations?: LeadOrganization[];
      };

      const parentInfo = space.parent
        ? {
            displayName: space.parent.about.profile.displayName,
            url: space.parent.about.profile.url,
            avatar: space.parent.about.profile.avatar
              ? {
                  id: '',
                  uri: space.parent.about.profile.avatar.uri,
                  alternativeText: space.parent.about.profile.avatar.alternativeText,
                }
              : undefined,
          }
        : undefined;

      vs.push(
        <SpaceCard
          key={id}
          spaceId={id}
          tagline={profile?.tagline ?? ''}
          displayName={profile?.displayName}
          spaceUri={profile?.url}
          level={level}
          banner={profile?.cardBanner}
          tags={profile?.tagset?.tags}
          avatarUris={collectParentAvatars(space) ?? []}
          parentInfo={parentInfo}
          matchedTerms={!!space.matchedTerms}
          leadUsers={membershipWithLeads?.leadUsers}
          leadOrganizations={membershipWithLeads?.leadOrganizations}
          showLeads={authenticated}
          isPrivate={!isContentPublic}
        />
      );
    });

    return vs;
  }, [visibleSpaces, shouldDisplayPrivacyInfo, authenticated]);

  const getGridItemStyle = useGridItem();

  const spacesLength = spaces?.length ?? 0;

  return (
    <PageContentBlock>
      <Gutters row disablePadding flexWrap="wrap" justifyContent="center" paddingTop={gutters(0.2)}>
        <SearchTagsInput
          value={searchTerms}
          placeholder={t('pages.exploreSpaces.search.placeholder')}
          onChange={(_event: unknown, newValue: string[]) => setSearchTerms(newValue)}
          fullWidth={false}
          sx={{ flexGrow: 1, flexBasis: getGridItemStyle(4).width }}
        />
        <Gutters row disablePadding maxWidth="100%" alignItems="center">
          {enabledFilters.map(filter => (
            <Button
              key={filter}
              variant={filter === membershipFilter ? 'contained' : 'outlined'}
              sx={{ textTransform: 'none', flexShrink: 1 }}
              onClick={() => onMembershipFilterChange?.(filter)}
            >
              <Caption noWrap>{t(`pages.exploreSpaces.membershipFilter.${filter}` as const)}</Caption>
            </Button>
          ))}
          <IconButton
            onClick={() => {
              setInfoOpen(true);
            }}
            aria-label={t('tooltips.click-more-info')}
            aria-haspopup="dialog"
            aria-controls={infoOpen ? 'space-explorer-info-dialog' : undefined}
          >
            <InfoOutlinedIcon color="primary" fontSize="small" />
          </IconButton>
        </Gutters>
      </Gutters>
      {hasNoMemberSpaces && (
        <CaptionSmall
          component={RouterLink}
          to={(authenticated ? welcomeSpace?.about.profile.url : buildLoginUrl(welcomeSpace?.about.profile.url)) ?? ''}
          marginX="auto"
          paddingY={gutters()}
        >
          {t('pages.exploreSpaces.noSpaceMemberships', { welcomeSpace: welcomeSpace?.about.profile.displayName })}
        </CaptionSmall>
      )}
      {searchTerms.length !== 0 && spacesLength === 0 && loadingSearchResults === false && (
        <CaptionSmall marginX="auto" paddingY={gutters()}>
          {t('pages.exploreSpaces.search.noResults')}
        </CaptionSmall>
      )}
      {loadingSearchResults && <Loading text={t('pages.exploreSpaces.search.searching')} />}
      {spacesLength > 0 && (
        <>
          <ScrollableCardsLayoutContainer>
            {renderVisibleSpaces()}

            {enableLazyLoading && loader}
          </ScrollableCardsLayoutContainer>
          {enableShowAll && (
            <SeeMoreExpandable onExpand={() => setHasExpanded(true)} label={t('pages.exploreSpaces.seeAll')} />
          )}
        </>
      )}
      {hasNoMemberSpaces && (
        <SeeMoreExpandable
          onExpand={() => onMembershipFilterChange?.(SpacesExplorerMembershipFilter.All)}
          label={t('pages.exploreSpaces.seeAll')}
        />
      )}
      {infoOpen && (
        <DialogWithGrid
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          columns={4}
          id="space-explorer-info-dialog"
          aria-labelledby="space-explorer-info-dialog-title"
        >
          <DialogHeader
            id="space-explorer-info-dialog-title"
            title={t('pages.exploreSpaces.fullName')}
            onClose={() => setInfoOpen(false)}
          />
          <DialogContent sx={{ paddingTop: 0 }}>
            <WrapperMarkdown caption>{t('pages.exploreSpaces.caption')}</WrapperMarkdown>
          </DialogContent>
        </DialogWithGrid>
      )}
    </PageContentBlock>
  );
};
