import { useTranslation } from 'react-i18next';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { ContributionLinkList } from '@/crd/components/contribution/ContributionLinkList';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import { Button } from '@/crd/primitives/button';
import { CroppedMarkdown } from '@/crd/primitives/croppedMarkdown';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import { getCalloutContributionType } from '../dataMappers/calloutDataMapper';
import { type ContributionCardData, mapAnyContributionToCardData } from '../dataMappers/contributionDataMapper';

const MAX_PREVIEW_ITEMS = 4;
const ITEMS_BEFORE_MORE = 3;

type ContributionsPreviewConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onShowAll: () => void;
  onContributionClick?: (contributionId: string, memoId?: string) => void;
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

  // Image-like contribution types (Whiteboard, Memo) use the "+N more" overlay on the last visible card.
  // Text-like types (Post) use a dashed "+N more" card.
  const usesOverlayPattern =
    contributionType === CalloutContributionType.Whiteboard || contributionType === CalloutContributionType.Memo;

  if (usesOverlayPattern && hasMore) {
    const lastContribution = contributions[ITEMS_BEFORE_MORE];
    return (
      <div ref={inViewRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {visibleItems.map(contribution => (
          <ContributionCard
            key={contribution.id}
            contribution={contribution}
            contributionType={contributionType}
            onClick={() => onContributionClick?.(contribution.id, contribution.memoId)}
          />
        ))}
        <OverlayMoreCard
          lastContribution={lastContribution}
          contributionType={contributionType}
          label={t('callout.moreContributions', { count: moreCount })}
          onClick={onShowAll}
        />
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
          onClick={() => onContributionClick?.(contribution.id, contribution.memoId)}
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

function OverlayMoreCard({
  lastContribution,
  contributionType,
  label,
  onClick,
}: {
  lastContribution: ContributionCardData | undefined;
  contributionType: CalloutContributionType;
  label: string;
  onClick: () => void;
}) {
  const showImage = contributionType === CalloutContributionType.Whiteboard && lastContribution?.previewUrl;
  const showMemoPreview = contributionType === CalloutContributionType.Memo && lastContribution?.markdownContent;

  return (
    <button
      type="button"
      className={
        'relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      }
      onClick={onClick}
    >
      {showImage && <img src={lastContribution.previewUrl} alt="" className="w-full h-full object-cover" />}
      {showMemoPreview && lastContribution.markdownContent && (
        <div className="p-4 h-full text-left">
          <CroppedMarkdown content={lastContribution.markdownContent} maxHeight="180px" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
        <span className="text-white font-bold text-subsection-title">{label}</span>
      </div>
    </button>
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
          author={contribution.author?.name}
          onClick={onClick}
        />
      );
    default:
      return null;
  }
}
