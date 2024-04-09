import React, { FC } from 'react';
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
import { CommunityMembershipStatus, ProfileType } from '../../../core/apollo/generated/graphql-schema';
import { Visual } from '../../../domain/common/visual/Visual';
import { gutters } from '../../../core/ui/grid/utils';
import useLazyLoading from '../../../domain/shared/pagination/useLazyLoading';
import SpaceSubspaceCardLabel from '../../../domain/journey/space/SpaceSubspaceCard/SpaceSubspaceCardLabel';

export interface SpaceExplorerViewProps {
  spaces: SpaceWithParent[] | undefined;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  membershipFilter: SpacesExplorerMembershipFilter;
  searchTerms: string[];
  onMembershipFilterChange?: (filter: SpacesExplorerMembershipFilter) => void;
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => Promise<void>;
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
  profile?: {
    displayName: string;
    avatar?: Visual;
  };
}

type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

interface Space extends Identifiable {
  profile?: {
    url: string;
    displayName: string;
    tagline: string;
    type?: ProfileType;
    tagset?: {
      tags: string[];
    };
    avatar?: Visual;
  };
  context?: {
    vision?: string;
  };
  community?: {
    myMembershipStatus?: CommunityMembershipStatus;
  };
  authorization?: {
    anonymousReadAccess: boolean;
  };
  matchedTerms?: string[];
}

const collectParentAvatars = <Journey extends WithParent<{ profile?: { avatar?: Visual } }>>(
  { parent }: Journey,
  collected: string[] = []
) => {
  if (!parent) {
    return collected;
  }
  return collectParentAvatars(parent, [parent.profile!.avatar!.uri, ...collected]);
};

export const SpaceExplorerView: FC<SpaceExplorerViewProps> = ({
  spaces,
  searchTerms,
  setSearchTerms,
  membershipFilter,
  loading,
  onMembershipFilterChange,
  fetchMore,
  hasMore,
}) => {
  const { t } = useTranslation();

  const loader = useLazyLoading(Box, { fetchMore, loading, hasMore });

  const shouldDisplayPrivacyInfo = membershipFilter !== SpacesExplorerMembershipFilter.Member;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.exploreSpaces.fullName')} />
      <WrapperMarkdown caption>{t('pages.exploreSpaces.caption')}</WrapperMarkdown>
      <Gutters row disablePadding>
        <SearchTagsInput
          value={searchTerms}
          placeholder={t('pages.exploreSpaces.search.placeholder')}
          onChange={(_event: unknown, newValue: string[]) => setSearchTerms(newValue)}
        />
        {SPACES_EXPLORER_MEMBERSHIP_FILTERS.map(filter => (
          <Button
            key={filter}
            variant={filter === membershipFilter ? 'contained' : 'outlined'}
            sx={{ flexShrink: 0, textTransform: 'none' }}
            onClick={() => onMembershipFilterChange?.(filter)}
          >
            <Caption noWrap>{t(`pages.exploreSpaces.membershipFilter.${filter}` as const)}</Caption>
          </Button>
        ))}
      </Gutters>
      {membershipFilter === SpacesExplorerMembershipFilter.Member &&
        searchTerms.length === 0 &&
        spaces &&
        spaces.length === 0 && (
          <CaptionSmall marginX="auto" paddingY={gutters()}>
            {t('pages.exploreSpaces.noSpaceMemberships')}
          </CaptionSmall>
        )}
      {searchTerms.length !== 0 && spaces && spaces.length === 0 && (
        <CaptionSmall marginX="auto" paddingY={gutters()}>
          {t('pages.exploreSpaces.search.noResults')}
        </CaptionSmall>
      )}
      {spaces && spaces.length > 0 && (
        <ScrollableCardsLayoutContainer>
          {spaces.map(space => (
            <SpaceSubspaceCard
              key={space.id}
              tagline={space.profile!.tagline}
              displayName={space.profile!.displayName}
              vision={space.context?.vision ?? ''}
              journeyUri={space.profile!.url}
              type={space.profile!.type!}
              avatarUris={collectParentAvatars(space, [space.profile!.avatar!.uri])}
              tags={space.matchedTerms ?? space.profile?.tagset?.tags ?? []}
              spaceDisplayName={space.parent?.profile?.displayName}
              matchedTerms={!!space.matchedTerms}
              label={
                shouldDisplayPrivacyInfo && (
                  <SpaceSubspaceCardLabel
                    type={space.profile!.type!}
                    member={space.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                    isPrivate={!space.authorization?.anonymousReadAccess}
                  />
                )
              }
            />
          ))}
          {loader}
        </ScrollableCardsLayoutContainer>
      )}
    </PageContentBlock>
  );
};