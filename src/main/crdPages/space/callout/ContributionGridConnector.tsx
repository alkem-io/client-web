import type { ReactNode } from 'react';
import { ContributionGrid } from '@/crd/components/contribution/ContributionGrid';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import type { ContributionCardData } from '../dataMappers/contributionDataMapper';

type ContributionGridConnectorProps = {
  contributions: ContributionCardData[];
  onContributionClick?: (id: string, memoId?: string) => void;
  /** Rendered at the end of the grid — used for the "Add Response" card */
  trailingSlot?: ReactNode;
};

export function ContributionGridConnector({
  contributions,
  onContributionClick,
  trailingSlot,
}: ContributionGridConnectorProps) {
  if (contributions.length === 0 && !trailingSlot) return null;

  return (
    <ContributionGrid totalCount={contributions.length + (trailingSlot ? 1 : 0)}>
      {contributions.map(contribution => {
        switch (contribution.type) {
          case 'whiteboard':
            return (
              <ContributionWhiteboardCard
                key={contribution.id}
                title={contribution.title}
                previewUrl={contribution.previewUrl}
                author={contribution.author?.name}
                onClick={() => onContributionClick?.(contribution.id)}
              />
            );
          case 'memo':
            return (
              <ContributionMemoCard
                key={contribution.id}
                title={contribution.title}
                markdownContent={contribution.markdownContent}
                author={contribution.author?.name}
                onClick={() => onContributionClick?.(contribution.id, contribution.memoId)}
              />
            );
          default:
            return (
              <ContributionPostCard
                key={contribution.id}
                title={contribution.title}
                author={contribution.author}
                createdDate={contribution.createdDate}
                description={contribution.description}
                tags={contribution.tags}
                commentCount={contribution.commentCount}
                onClick={() => onContributionClick?.(contribution.id)}
              />
            );
        }
      })}
      {trailingSlot}
    </ContributionGrid>
  );
}
