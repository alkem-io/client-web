import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { useParentSpaceInfo } from '@/domain/space/components/cards/utils/useParentSpaceInfo';
import { collectSubspaceAvatars } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import useContributionProvider from '../../profile/useContributionProvider/useContributionProvider';

type ContributionViewProps = {
  contributions: SpaceHostedItem[] | undefined;
  title: string;
};

export const TilesContributionsView = ({ contributions, title }: ContributionViewProps) => {
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      <PageContentBlockGrid disablePadding={true}>
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
      compact={true}
    />
  );
};

export default TilesContributionsView;
