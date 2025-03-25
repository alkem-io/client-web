import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model.';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyTile from '@/domain/space/components/JourneyTile';
import useContributionProvider from '../../profile/useContributionProvider/useContributionProvider';

type ContributionViewProps = {
  contributions: SpaceHostedItem[] | undefined;
  title: string;
};

export const ContributionsView = ({ contributions, title }: ContributionViewProps) => {
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      <PageContentBlockGrid disablePadding>
        <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
          {contributions?.map(contributionItem => (
            <ContributionItem key={contributionItem.id} contributionItem={contributionItem} />
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

const ContributionItem = ({ contributionItem }) => {
  const { details, loading } = useContributionProvider({
    spaceHostedItem: contributionItem,
  });

  return (
    <JourneyTile
      key={contributionItem.id}
      journey={loading || !details ? undefined : { about: details.about, level: details.level }}
    />
  );
};

export default ContributionsView;
