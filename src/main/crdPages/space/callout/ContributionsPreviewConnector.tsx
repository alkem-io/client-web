import { useTranslation } from 'react-i18next';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { ContributionLinkList } from '@/crd/components/contribution/ContributionLinkList';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import { Button } from '@/crd/primitives/button';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import { getCalloutContributionType } from '../dataMappers/calloutDataMapper';
import { type ContributionCardData, mapAnyContributionToCardData } from '../dataMappers/contributionDataMapper';

const MAX_PREVIEW_ITEMS = 4;
const ITEMS_BEFORE_MORE = 3;

type ContributionsPreviewConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onShowAll: () => void;
  onContributionClick?: (contributionId: string) => void;
};

export function ContributionsPreviewConnector({
  callout,
  onShowAll,
  onContributionClick,
}: ContributionsPreviewConnectorProps) {
  const { t } = useTranslation('crd-space');

  const contributionType = getCalloutContributionType(callout);
  const contributionsEnabled = callout.settings.contribution.enabled && !!contributionType;

  const {
    inViewRef,
    contributions: { items, total },
  } = useCalloutContributions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
    pageSize: MAX_PREVIEW_ITEMS,
    skip: !contributionsEnabled,
  });

  const contributions = items.map(item => mapAnyContributionToCardData(item)).filter(Boolean) as ContributionCardData[];

  if (!contributionsEnabled || !contributionType || contributions.length === 0) {
    return <div ref={inViewRef} />;
  }

  const hasMore = total > MAX_PREVIEW_ITEMS;
  const visibleItems = hasMore ? contributions.slice(0, ITEMS_BEFORE_MORE) : contributions;
  const moreCount = total - ITEMS_BEFORE_MORE;

  // Links render as a list, not cards
  if (contributionType === CalloutContributionType.Link) {
    const links = contributions.map(c => ({
      id: c.id,
      url: c.linkUrl ?? '',
      displayName: c.title,
      description: c.linkDescription,
    }));

    return (
      <div ref={inViewRef} className="mt-4">
        <ContributionLinkList links={hasMore ? links.slice(0, ITEMS_BEFORE_MORE) : links} />
        {hasMore && (
          <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={onShowAll}>
            {t('callout.moreContributions', { count: moreCount })}
          </Button>
        )}
      </div>
    );
  }

  // Whiteboards use the "+N more" overlay on the last thumbnail (matching prototype)
  if (contributionType === CalloutContributionType.Whiteboard && hasMore) {
    const lastContribution = contributions[ITEMS_BEFORE_MORE];
    return (
      <div ref={inViewRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {visibleItems.map(contribution => (
          <ContributionWhiteboardCard
            key={contribution.id}
            title={contribution.title}
            previewUrl={contribution.previewUrl}
            author={contribution.author?.name}
            onClick={() => onContributionClick?.(contribution.id)}
          />
        ))}
        {/* "+N more" overlay on the 4th thumbnail */}
        <button
          type="button"
          className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 aspect-[4/3] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onShowAll}
        >
          {lastContribution?.previewUrl && (
            <img src={lastContribution.previewUrl} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
            <span className="text-white font-bold text-subsection-title">
              {t('callout.moreContributions', { count: moreCount })}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div ref={inViewRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {visibleItems.map(contribution => (
        <ContributionCard
          key={contribution.id}
          contribution={contribution}
          contributionType={contributionType}
          onClick={() => onContributionClick?.(contribution.id)}
        />
      ))}
      {hasMore && (
        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground text-card-title min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onShowAll}
        >
          {t('callout.moreContributions', { count: moreCount })}
        </button>
      )}
    </div>
  );
}

function ContributionCard({
  contribution,
  contributionType,
  onClick,
}: {
  contribution: ContributionCardData;
  contributionType: CalloutContributionType;
  onClick?: () => void;
}) {
  switch (contributionType) {
    case CalloutContributionType.Whiteboard:
      return (
        <ContributionWhiteboardCard
          title={contribution.title}
          previewUrl={contribution.previewUrl}
          author={contribution.author?.name}
          onClick={onClick}
        />
      );
    case CalloutContributionType.Post:
      return (
        <ContributionPostCard
          title={contribution.title}
          author={contribution.author}
          createdDate={contribution.createdDate}
          description={contribution.description}
          tags={contribution.tags}
          commentCount={contribution.commentCount}
          onClick={onClick}
        />
      );
    case CalloutContributionType.Memo:
      return (
        <ContributionMemoCard
          title={contribution.title}
          markdownContent={contribution.markdownContent}
          onClick={onClick}
        />
      );
    default:
      return null;
  }
}
