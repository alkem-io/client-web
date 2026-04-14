import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import { mapCalloutDetailsToPostCard } from '../dataMappers/calloutDataMapper';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';
import { CalloutPollConnector } from './CalloutPollConnector';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation('crd-space');
  const formatDate = (key: string, options?: Record<string, unknown>) => String(t(key as never, options as never));
  const { ref, inView, callout, loading } = useCalloutInView({
    calloutId,
    calloutsSetId,
  });

  return (
    <div ref={ref} id={calloutId}>
      {inView && !loading && callout ? (
        <>
          <PostCard
            post={mapCalloutDetailsToPostCard(callout, formatDate)}
            onClick={() => {
              setDialogOpen(true);
              onClick?.();
            }}
            onCommentsClick={() => {
              setDialogOpen(true);
            }}
            onSettingsClick={onSettingsClick}
            onExpandClick={onExpandClick}
          >
            {callout.framing.type === CalloutFramingType.Poll && <CalloutPollConnector callout={callout} />}
          </PostCard>

          <CalloutDetailDialogConnector open={dialogOpen} onOpenChange={setDialogOpen} callout={callout} />
        </>
      ) : (
        <PostCardSkeleton />
      )}
    </div>
  );
}
