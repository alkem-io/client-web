import { GridLegacy, Skeleton } from '@mui/material';
import React, { useState } from 'react';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model.';
import { Caption } from '@/core/ui/typography';
import PageContentBlockGrid, { PageContentBlockGridProps } from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import ContributionDetailsCard from '@/domain/community/profile/views/ContributionDetailsCard';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import useContributionProvider, {
  ContributionDetails,
} from '@/domain/community/profile/useContributionProvider/useContributionProvider';

type ActionableContributionsViewProps = {
  title: string;
  subtitle?: string;
  emptyCaption?: string;
  contributions: SpaceHostedItem[] | undefined;
  loading?: boolean;
  enableLeave?: boolean;
  onLeave?: () => Promise<unknown>;
  onContributionClick?: (event: React.MouseEvent<Element, MouseEvent>, contribution: ContributionDetails) => void;
  cards?: PageContentBlockGridProps['cards'];
};

const SkeletonItem = () => (
  <GridLegacy item>
    <Skeleton
      variant="rectangular"
      sx={{
        height: theme => theme.spacing(theme.cards.contributionCard.height / 2),
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
  </GridLegacy>
);

/**
 * This component is used mainly in admin area for actionable space cards
 */
export const ActionableContributionsView = ({
  title,
  subtitle,
  emptyCaption,
  contributions,
  loading,
  enableLeave,
  onLeave,
  onContributionClick,
  cards,
}: ActionableContributionsViewProps) => {
  const [leavingRoleSetId, setLeavingRoleSetId] = useState<string>();

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={title} />
      {subtitle && <Caption>{subtitle}</Caption>}
      <PageContentBlockGrid disablePadding cards={cards}>
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}
        {!loading && contributions?.length === 0 && emptyCaption && <Caption>{emptyCaption}</Caption>}
        {!loading && (
          <ScrollableCardsLayoutContainer containerProps={{ flex: 1 }}>
            {contributions?.map(contributionItem => (
              <ContributionCard
                key={contributionItem.id}
                contributionItem={contributionItem}
                onLeave={onLeave}
                enableLeave={enableLeave}
                leavingRoleSetId={leavingRoleSetId}
                setLeavingRoleSetId={setLeavingRoleSetId}
                onContributionClick={onContributionClick}
              />
            ))}
          </ScrollableCardsLayoutContainer>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

const ContributionCard = ({
  contributionItem,
  onLeave,
  enableLeave,
  leavingRoleSetId,
  setLeavingRoleSetId,
  onContributionClick,
}) => {
  const { details, loading, isLeavingCommunity, leaveCommunity } = useContributionProvider({
    spaceHostedItem: contributionItem,
  });

  if (loading || !details) {
    return null;
  }

  const handleLeaveCommunity = async () => {
    await leaveCommunity();
    onLeave?.();
  };

  return (
    <ContributionDetailsCard
      {...details}
      tagline={details.about.profile.tagline!}
      displayName={details.about.profile.displayName}
      enableLeave={enableLeave}
      leavingCommunity={isLeavingCommunity}
      handleLeaveCommunity={handleLeaveCommunity}
      leavingCommunityDialogOpen={!!leavingRoleSetId && leavingRoleSetId === details?.roleSetId}
      onLeaveCommunityDialogOpen={isOpen => setLeavingRoleSetId(isOpen ? details?.roleSetId : undefined)}
      onClick={onContributionClick ? event => onContributionClick(event, details) : undefined}
    />
  );
};

export default ActionableContributionsView;
