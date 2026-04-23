import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import { mapCalloutDetailsToPostCard } from '../dataMappers/calloutDataMapper';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';

type LazyCalloutItemProps = {
  calloutId: string;
  calloutsSetId: string | undefined;
  onClick?: () => void;
  onSettingsClick?: () => void;
  onExpandClick?: () => void;
};

export function LazyCalloutItem({
  calloutId,
  calloutsSetId,
  onClick,
  onSettingsClick,
  onExpandClick,
}: LazyCalloutItemProps) {
  const { ref, inView, callout, loading } = useCalloutInView({
    calloutId,
    calloutsSetId,
  });

  return (
    <div ref={ref} id={calloutId}>
      {inView && !loading && callout ? (
        <LazyCalloutItemContent
          callout={callout}
          onClick={onClick}
          onSettingsClick={onSettingsClick}
          onExpandClick={onExpandClick}
        />
      ) : (
        <PostCardSkeleton />
      )}
    </div>
  );
}

/**
 * Inner component rendered once the callout is loaded.
 * Separated so hooks can be called unconditionally.
 */
function LazyCalloutItemContent({
  callout,
  onClick,
  onSettingsClick,
  onExpandClick,
}: {
  callout: CalloutDetailsModelExtended;
  onClick?: () => void;
  onSettingsClick?: () => void;
  onExpandClick?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialContributionId, setInitialContributionId] = useState<string | undefined>();
  const [initialMemoId, setInitialMemoId] = useState<string | undefined>();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const { t } = useTranslation('crd-space');
  const formatDate = (key: string, options?: Record<string, unknown>) => String(t(key as never, options as never));

  const postData = mapCalloutDetailsToPostCard(callout, formatDate);

  const openDialog = (contributionId?: string, memoId?: string) => {
    setInitialContributionId(contributionId);
    setInitialMemoId(memoId);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInitialContributionId(undefined);
      setInitialMemoId(undefined);
    }
  };

  const contributionsEnabled = callout.settings.contribution.enabled;

  const contributionsPreview = contributionsEnabled ? (
    <ContributionsPreviewConnector
      callout={callout}
      onShowAll={() => openDialog()}
      onContributionClick={(contributionId, memoId) => openDialog(contributionId, memoId)}
    />
  ) : undefined;

  const pollPreview =
    callout.framing.type === CalloutFramingType.Poll ? <CalloutPollConnector callout={callout} /> : null;

  // Without a comments room we can't wire the inline thread — fall back to the
  // dialog-only flow. The dialog itself handles its own "no room" rendering.
  const commentsRoomId = callout.comments?.id;
  const hasCommentsRoom = Boolean(commentsRoomId) && callout.comments !== undefined;

  return (
    <>
      {hasCommentsRoom && commentsRoomId ? (
        <CalloutCommentsConnector
          roomId={commentsRoomId}
          calloutId={callout.id}
          roomData={callout.comments}
          skipSubscription={!commentsExpanded}
        >
          {({ thread, commentInput }) => (
            <PostCard
              post={postData}
              onClick={() => {
                openDialog();
                onClick?.();
              }}
              onSettingsClick={onSettingsClick}
              onExpandClick={onExpandClick}
              commentsSlot={thread}
              commentInputSlot={commentInput}
              onCommentsExpandedChange={setCommentsExpanded}
              contributionsPreview={contributionsPreview}
            >
              {pollPreview}
            </PostCard>
          )}
        </CalloutCommentsConnector>
      ) : (
        <PostCard
          post={postData}
          onClick={() => {
            openDialog();
            onClick?.();
          }}
          onCommentsClick={() => openDialog()}
          onSettingsClick={onSettingsClick}
          onExpandClick={onExpandClick}
          contributionsPreview={contributionsPreview}
        >
          {pollPreview}
        </PostCard>
      )}

      <CalloutDetailDialogConnector
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        callout={callout}
        initialContributionId={initialContributionId}
        initialMemoId={initialMemoId}
      />
    </>
  );
}
