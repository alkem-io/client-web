import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import ContributionDetailsContainer from '@/domain/community/profile/ContributionDetails/ContributionDetailsContainer';
import JourneyTile from '@/domain/journey/common/JourneyTile/JourneyTile';

type ContributionViewProps = {
  contributions: SpaceHostedItem[] | undefined;
  title: string;
};

export const ContributionsView = ({ contributions, title }: ContributionViewProps) => (
  <PageContentBlock>
    <PageContentBlockHeader title={title} />
    <PageContentBlockGrid disablePadding>
      <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
        {contributions?.map(contributionItem => (
          <ContributionDetailsContainer key={contributionItem.id} entities={contributionItem}>
            {({ details }, { loading }) => {
              if (loading || !details) {
                return <JourneyTile journey={undefined} />;
              }

              return (
                <JourneyTile
                  journey={{
                    about: details.about,
                    level: details.level,
                  }}
                />
              );
            }}
          </ContributionDetailsContainer>
        ))}
      </ScrollableCardsLayoutContainer>
    </PageContentBlockGrid>
  </PageContentBlock>
);

export default ContributionsView;
