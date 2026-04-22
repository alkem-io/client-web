import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import { mapCalloutDetailsToPostCard } from '../dataMappers/calloutDataMapper';
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

  return (
    <>
      <PostCard
        post={postData}
        onClick={() => {
          openDialog();
          onClick?.();
        }}
        onCommentsClick={() => openDialog()}
        onSettingsClick={onSettingsClick}
        onExpandClick={onExpandClick}
        contributionsPreview={
          contributionsEnabled ? (
            <ContributionsPreviewConnector
              callout={callout}
              onShowAll={() => openDialog()}
              onContributionClick={(contributionId, memoId) => openDialog(contributionId, memoId)}
            />
          ) : undefined
        }
      >
        {callout.framing.type === CalloutFramingType.Poll && <CalloutPollConnector callout={callout} />}
      </PostCard>

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
