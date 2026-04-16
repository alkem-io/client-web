import { ContributionGrid } from '@/crd/components/contribution/ContributionGrid';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import type { ContributionCardData } from '../dataMappers/contributionDataMapper';

type ContributionGridConnectorProps = {
  contributions: ContributionCardData[];
  onContributionClick?: (id: string) => void;
};

export function ContributionGridConnector({ contributions, onContributionClick }: ContributionGridConnectorProps) {
  if (contributions.length === 0) return null;

  return (
    <ContributionGrid totalCount={contributions.length}>
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
                onClick={() => onContributionClick?.(contribution.id)}
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
    </ContributionGrid>
  );
}
