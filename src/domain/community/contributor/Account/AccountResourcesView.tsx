import { ExpandMore } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel, type SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useScreenSize } from '@/core/ui/grid/constants';
import { useColumns } from '@/core/ui/grid/GridContext';
import GridItem from '@/core/ui/grid/GridItem';
import Gutters from '@/core/ui/grid/Gutters';
import { BlockTitle } from '@/core/ui/typography';
import InnovationPackCardHorizontal from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';

const VISIBLE_SPACE_LIMIT = 6;

type AccountProfile = {
  id: string;
  displayName: string;
  description?: string;
  avatar?: { uri: string };
  cardBanner?: { uri: string };
  url: string;
  tagline?: string;
};

export interface AccountResourcesProps {
  id: string;
  spaces: {
    id: string;
    visibility: SpaceVisibility;
    about: SpaceAboutLightModel;
  }[];
  virtualContributors: {
    id: string;
    profile?: AccountProfile;
  }[];
  innovationPacks: {
    id: string;
    profile: AccountProfile;
    templates?: {
      calloutTemplatesCount: number;
      spaceTemplatesCount: number;
      communityGuidelinesTemplatesCount: number;
      postTemplatesCount: number;
      whiteboardTemplatesCount: number;
    };
  }[];
  innovationHubs: {
    id: string;
    profile: AccountProfile & {
      banner?: { uri: string };
    };
    subdomain: string;
  }[];
}

interface AccountResourcesViewProps {
  accountResources: AccountResourcesProps;
  title: string;
}

export const AccountResourcesView = ({ accountResources, title }: AccountResourcesViewProps) => {
  const { t } = useTranslation();

  const [visibleSpacesCount, setVisibleSpacesCount] = useState(VISIBLE_SPACE_LIMIT);

  const { isSmallScreen } = useScreenSize();

  const columns = useColumns();

  const resourceColumns = isSmallScreen ? columns : columns / 3;

  const showSpaceMoreButton =
    accountResources.spaces.length > VISIBLE_SPACE_LIMIT && visibleSpacesCount === VISIBLE_SPACE_LIMIT;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      {accountResources?.spaces && accountResources?.spaces.length > 0 && (
        <PageContentBlockGrid disablePadding={true}>
          <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
            {accountResources.spaces?.slice(0, visibleSpacesCount).map(contributionItem => {
              const avatarUris = collectSubspaceAvatars(
                {
                  id: contributionItem.id,
                  about: {
                    profile: {
                      displayName: contributionItem.about.profile.displayName,
                      avatar: contributionItem.about.profile.avatar,
                      cardBanner: contributionItem.about.profile.cardBanner,
                    },
                  },
                },
                undefined, // no parent for L0 spaces
                undefined
              );

              return (
                <SpaceCard
                  key={contributionItem.id}
                  spaceId={contributionItem.id}
                  displayName={contributionItem.about.profile.displayName}
                  banner={contributionItem.about.profile.cardBanner}
                  spaceUri={contributionItem.about.profile.url}
                  spaceVisibility={contributionItem.visibility}
                  isPrivate={!contributionItem.about.isContentPublic}
                  level={SpaceLevel.L0}
                  avatarUris={avatarUris}
                  tags={contributionItem.about.profile.tagset?.tags}
                  compact={true}
                />
              );
            })}
          </ScrollableCardsLayoutContainer>
        </PageContentBlockGrid>
      )}
      {showSpaceMoreButton && (
        <Actions padding={0} justifyContent="end">
          <Button
            startIcon={<ExpandMore />}
            onClick={() => setVisibleSpacesCount(accountResources.spaces.length)}
            sx={{ textTransform: 'none', minWidth: 0, padding: 0.8 }}
          >
            {t('components.dashboardNavigation.showAll')}
          </Button>
        </Actions>
      )}
      <PageContentBlockGrid disablePadding={true}>
        {accountResources?.virtualContributors && accountResources?.virtualContributors.length > 0 && (
          <GridItem columns={resourceColumns}>
            <Gutters>
              <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
              <Gutters disablePadding={true}>
                {accountResources?.virtualContributors?.map(vc => (
                  <ContributorCardHorizontal key={vc.id} profile={vc.profile} withUnifiedTitle={true} seamless={true} />
                ))}
              </Gutters>
            </Gutters>
          </GridItem>
        )}
        {accountResources?.innovationPacks && accountResources?.innovationPacks.length > 0 && (
          <GridItem columns={resourceColumns}>
            <Gutters>
              <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
              <Gutters disablePadding={true}>
                {accountResources?.innovationPacks?.map(pack => (
                  <InnovationPackCardHorizontal key={pack.id} {...pack} />
                ))}
              </Gutters>
            </Gutters>
          </GridItem>
        )}
        {accountResources?.innovationHubs && accountResources?.innovationHubs.length > 0 && (
          <GridItem columns={resourceColumns}>
            <Gutters>
              <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
              <Gutters disablePadding={true}>
                {accountResources?.innovationHubs?.map(hub => (
                  <InnovationHubCardHorizontal key={hub.id} {...hub} />
                ))}
              </Gutters>
            </Gutters>
          </GridItem>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default AccountResourcesView;
