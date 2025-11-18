import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import useContributionProvider from '../../profile/useContributionProvider/useContributionProvider';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import { useParentSpaceInfo } from '@/domain/space/components/cards/utils/useParentSpaceInfo';

type ContributionViewProps = {
  contributions: SpaceHostedItem[] | undefined;
  title: string;
};

export const TilesContributionsView = ({ contributions, title }: ContributionViewProps) => {
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

  // Fetch parent space info if this is a subspace
  const { parentInfo, parentAvatarUri, parentDisplayName } = useParentSpaceInfo(contributionItem.parentSpaceId);

  if (loading || !details) {
    return null;
  }

  const avatarUris = collectSubspaceAvatars(
    {
      id: contributionItem.id,
      about: {
        profile: {
          displayName: details.about.profile.displayName,
          avatar: details.about.profile.avatar,
          cardBanner: details.about.profile.cardBanner,
        },
      },
    },
    parentAvatarUri,
    parentDisplayName
  );

  return (
    <SpaceCard
      key={contributionItem.id}
      spaceId={contributionItem.id}
      displayName={details.about.profile.displayName}
      banner={details.about.profile.cardBanner}
      spaceUri={details.about.profile.url}
      isPrivate={!details.about.isContentPublic}
      level={details.level}
      avatarUris={avatarUris}
      parentInfo={parentInfo}
      tags={details.about.profile.tagset?.tags}
      compact
    />
  );
};

export default TilesContributionsView;
