import { GridLegacy, Skeleton } from '@mui/material';
import React from 'react';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { Caption } from '@/core/ui/typography';
import PageContentBlockGrid, { PageContentBlockGridProps } from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import ContributionCard, { ContributionCardProps } from './ContributionCard';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';

type ActionableContributionsViewProps = Pick<
  ContributionCardProps,
  'enableLeave' | 'onLeave' | 'onContributionClick'
> & {
  title: string;
  subtitle?: string;
  emptyCaption?: string;
  contributions: SpaceHostedItem[] | undefined;
  loading?: boolean;
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
  cards,
}: ActionableContributionsViewProps) => {

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
              />
            ))}
          </ScrollableCardsLayoutContainer>
        )}
      </PageContentBlockGrid>
    </PageContentBlock>
  );
};

export default ActionableContributionsView;
