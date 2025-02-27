import { useState } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyTile from '@/domain/journey/common/JourneyTile/JourneyTile';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import GridItem from '@/core/ui/grid/GridItem';
import { useColumns } from '@/core/ui/grid/GridContext';
import { Button, Theme, useMediaQuery } from '@mui/material';
import { Actions } from '@/core/ui/actions/Actions';
import { ExpandMore } from '@mui/icons-material';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

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
    about: SpaceAboutLightModel;
  }[];
  virtualContributors: {
    id: string;
    profile: AccountProfile;
  }[];
  innovationPacks: {
    id: string;
    profile: AccountProfile;
    templates?: {
      calloutTemplatesCount: number;
      collaborationTemplatesCount: number;
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
    spaceVisibilityFilter?: SpaceVisibility;
    spaceListFilter?: {
      id: string;
      about: SpaceAboutMinimalUrlModel;
    }[];
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

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const columns = useColumns();

  const resourceColumns = isMobile ? columns : columns / 3;

  const showSpaceMoreButton =
    accountResources.spaces.length > VISIBLE_SPACE_LIMIT && visibleSpacesCount === VISIBLE_SPACE_LIMIT;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      {accountResources?.spaces && accountResources?.spaces.length > 0 && (
        <PageContentBlockGrid disablePadding>
          <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
            {accountResources.spaces?.slice(0, visibleSpacesCount).map(contributionItem => (
              <JourneyTile
                key={contributionItem.id}
                journey={{
                  about: contributionItem.about,
                  level: SpaceLevel.L0,
                }}
              />
            ))}
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
      <PageContentBlockGrid disablePadding>
        {accountResources?.virtualContributors && accountResources?.virtualContributors.length > 0 && (
          <GridItem columns={resourceColumns}>
            <Gutters>
              <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
              <Gutters disablePadding>
                {accountResources?.virtualContributors?.map(vc => (
                  <ContributorCardHorizontal key={vc.id} profile={vc.profile} withUnifiedTitle seamless />
                ))}
              </Gutters>
            </Gutters>
          </GridItem>
        )}
        {accountResources?.innovationPacks && accountResources?.innovationPacks.length > 0 && (
          <GridItem columns={resourceColumns}>
            <Gutters>
              <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
              <Gutters disablePadding>
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
              <Gutters disablePadding>
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
