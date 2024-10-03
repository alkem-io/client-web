import React from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyTile from '../../../journey/common/JourneyTile/JourneyTile';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';

interface AccountProfile {
  id: string;
  displayName: string;
  description?: string;
  avatar?: { uri: string };
  cardBanner?: { uri: string };
  url: string;
  tagline?: string;
}

export interface AccountResourcesProps {
  id: string;
  spaces: {
    id: string;
    profile: AccountProfile;
  }[];
  virtualContributors: {
    id: string;
    profile: AccountProfile & {
      tagline?: string;
    };
  }[];
  innovationPacks: {
    id: string;
    profile: AccountProfile;
    templates?: {
      calloutTemplatesCount: number;
      communityGuidelinesTemplatesCount: number;
      innovationFlowTemplatesCount: number;
      postTemplatesCount: number;
      whiteboardTemplatesCount: number;
    };
  }[];
  innovationHubs: {
    id: string;
    profile: AccountProfile & {
      banner?: { uri: string };
    };
    spaceVisibilityFilter?: SpaceVisibility;
    spaceListFilter?: {
      id: string;
      profile: {
        displayName: string;
      };
    }[];
    subdomain: string;
  }[];
}

interface AccountResourcesViewProps {
  accountResources: AccountResourcesProps;
  title: string;
}

export const AccountResourcesView = ({ accountResources, title }: AccountResourcesViewProps) => {
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      <PageContentBlockGrid disablePadding>
        <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
          {accountResources.spaces?.map(contributionItem => (
            <JourneyTile
              journey={{
                profile: {
                  displayName: contributionItem.profile.displayName,
                  url: contributionItem.profile.url,
                  cardBanner: contributionItem.profile.cardBanner,
                },
              }}
              journeyTypeName="space"
            />
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default AccountResourcesView;
