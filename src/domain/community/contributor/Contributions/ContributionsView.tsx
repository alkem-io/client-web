import React from 'react';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '@core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '@core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import ContributionDetailsContainer from '../../profile/ContributionDetails/ContributionDetailsContainer';
import JourneyTile from '../../../journey/common/JourneyTile/JourneyTile';

interface ContributionViewProps {
  contributions: SpaceHostedItem[] | undefined;
  title: string;
}

export const ContributionsView = ({ contributions, title }: ContributionViewProps) => {
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      <PageContentBlockGrid disablePadding>
        <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
          {contributions?.map(contributionItem => (
            <ContributionDetailsContainer key={contributionItem.id} entities={contributionItem}>
              {({ details }, { loading }) => {
                if (loading || !details) {
                  return <JourneyTile journey={undefined} journeyTypeName="space" />;
                }

                return (
                  <JourneyTile
                    journey={{
                      profile: {
                        displayName: details.displayName,
                        url: details.journeyUri,
                        cardBanner: details.banner,
                      },
                    }}
                    journeyTypeName={details.journeyTypeName}
                  />
                );
              }}
            </ContributionDetailsContainer>
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default ContributionsView;
