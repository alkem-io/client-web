import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import { Caption, CaptionSmall } from '../../../core/ui/typography';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import { Box, Button } from '@mui/material';
import SearchTagsInput from '../../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import Gutters from '../../../core/ui/grid/Gutters';
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import SpaceSubspaceCard from '../../../domain/journey/space/SpaceSubspaceCard/SpaceSubspaceCard';
import { Identifiable } from '../../../core/utils/Identifiable';
import {
  CommunityMembershipStatus,
  ProfileType,
  SpacePrivacyMode,
} from '../../../core/apollo/generated/graphql-schema';
import { Visual } from '../../../domain/common/visual/Visual';
import { gutters, useGridItem } from '../../../core/ui/grid/utils';
import useLazyLoading from '../../../domain/shared/pagination/useLazyLoading';
import SpaceSubspaceCardLabel from '../../../domain/journey/space/SpaceSubspaceCard/SpaceSubspaceCardLabel';
import SeeMoreExpandable from '../../../core/ui/content/SeeMoreExpandable';
import { buildLoginUrl } from '../../routing/urlBuilders';
import RouterLink from '../../../core/ui/link/RouterLink';

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
  welcomeSpace?: {
    displayName: string;
    url: string;
  };
  fetchWelcomeSpace?: (args: { variables: { spaceNameId: string } }) => void;
}

export enum SpacesExplorerMembershipFilter {
  All = 'all',
  Member = 'member',
  Public = 'public',
}

const SPACES_EXPLORER_MEMBERSHIP_FILTERS: SpacesExplorerMembershipFilter[] = [
  SpacesExplorerMembershipFilter.All,
  SpacesExplorerMembershipFilter.Member,
  SpacesExplorerMembershipFilter.Public,
];

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
    tagline: string;
    type?: ProfileType;
    tagset?: {
      tags: string[];
    };
    avatar?: Visual;
    cardBanner?: Visual;
  };
  context?: {
    vision?: string;
  };
  community?: {
    myMembershipStatus?: CommunityMembershipStatus;
  };
  matchedTerms?: string[];
  settings: {
    privacy?: {
      mode: SpacePrivacyMode;
    };
  };
}

interface WithBanner {
  profile: { avatar?: Visual; cardBanner?: Visual };
}

const collectParentAvatars = <Journey extends WithBanner & WithParent<WithBanner>>(
  { profile, parent }: Journey,
  initial: string[] = []
) => {
  const { cardBanner, avatar = cardBanner } = profile;
  const collected = [avatar?.uri ?? '', ...initial];

  if (!parent) {
    return collected;
  } else {
    return collectParentAvatars(parent, collected);
  }
};

export const ITEMS_LIMIT = 10;

export const SpaceExplorerView: FC<SpaceExplorerViewProps> = ({
  spaces,
  searchTerms,
  setSearchTerms,
  membershipFilter,
  loading,
  onMembershipFilterChange,
  fetchMore,
  hasMore,
  authenticated,
  welcomeSpace,
  fetchWelcomeSpace,
}) => {
  const { t } = useTranslation();

  const [hasExpanded, setHasExpanded] = useState(false);

  const isCollapsed = !hasExpanded && membershipFilter !== SpacesExplorerMembershipFilter.Member;

  const enableLazyLoading = !isCollapsed || (spaces && spaces.length < ITEMS_LIMIT);

  const enableShowAll = isCollapsed && spaces && (spaces.length > ITEMS_LIMIT || hasMore);

  const loader = useLazyLoading(Box, { fetchMore, loading, hasMore });

  const shouldDisplayPrivacyInfo = membershipFilter !== SpacesExplorerMembershipFilter.Member;

  const visibleSpaces = isCollapsed ? spaces?.slice(0, ITEMS_LIMIT) : spaces;

  const hasNoMemberSpaces =
    (membershipFilter === SpacesExplorerMembershipFilter.Member && !authenticated) || spaces?.length === 0;

  useEffect(() => {
    if (hasNoMemberSpaces) {
      fetchWelcomeSpace?.({
        variables: { spaceNameId: t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId') },
      });
    }
  }, [hasNoMemberSpaces]);

  const getGridItemStyle = useGridItem();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.exploreSpaces.fullName')} />
      <WrapperMarkdown caption>{t('pages.exploreSpaces.caption')}</WrapperMarkdown>
      <Gutters row disablePadding flexWrap="wrap" justifyContent="center">
        <SearchTagsInput
          value={searchTerms}
          placeholder={t('pages.exploreSpaces.search.placeholder')}
          onChange={(_event: unknown, newValue: string[]) => setSearchTerms(newValue)}
          fullWidth={false}
          sx={{ flexGrow: 1, flexBasis: getGridItemStyle(4).width }}
        />
        <Gutters row disablePadding maxWidth="100%">
          {SPACES_EXPLORER_MEMBERSHIP_FILTERS.map(filter => (
            <Button
              key={filter}
              variant={filter === membershipFilter ? 'contained' : 'outlined'}
              sx={{ textTransform: 'none', flexShrink: 1 }}
              onClick={() => onMembershipFilterChange?.(filter)}
            >
              <Caption noWrap>{t(`pages.exploreSpaces.membershipFilter.${filter}` as const)}</Caption>
            </Button>
          ))}
        </Gutters>
      </Gutters>
      {hasNoMemberSpaces && (
        <CaptionSmall
          component={RouterLink}
          to={(authenticated ? welcomeSpace?.url : buildLoginUrl(welcomeSpace?.url)) ?? ''}
          marginX="auto"
          paddingY={gutters()}
        >
          {t('pages.exploreSpaces.noSpaceMemberships', { welcomeSpace: welcomeSpace?.displayName })}
        </CaptionSmall>
      )}
      {searchTerms.length !== 0 && spaces && spaces.length === 0 && (
        <CaptionSmall marginX="auto" paddingY={gutters()}>
          {t('pages.exploreSpaces.search.noResults')}
        </CaptionSmall>
      )}
      {spaces && spaces.length > 0 && (
        <>
          <ScrollableCardsLayoutContainer>
            {visibleSpaces!.map(space => (
              <SpaceSubspaceCard
                key={space.id}
                tagline={space.profile.tagline}
                displayName={space.profile.displayName}
                vision={space.context?.vision ?? ''}
                journeyUri={space.profile.url}
                type={space.profile.type!}
                banner={space.profile.cardBanner}
                avatarUris={collectParentAvatars(space)}
                tags={space.matchedTerms ?? space.profile.tagset?.tags.length ? space.profile.tagset?.tags : undefined}
                spaceDisplayName={space.parent?.profile?.displayName}
                matchedTerms={!!space.matchedTerms}
                label={
                  shouldDisplayPrivacyInfo && (
                    <SpaceSubspaceCardLabel
                      type={space.profile.type!}
                      member={space.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                      isPrivate={space.settings.privacy?.mode === SpacePrivacyMode.Private}
                    />
                  )
                }
              />
            ))}
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
    </PageContentBlock>
  );
};
