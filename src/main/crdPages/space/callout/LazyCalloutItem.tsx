import { PostCard } from '@/crd/components/space/PostCard';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import useCalloutInView from '@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView';
import { mapCalloutDetailsToPostCard } from '../dataMappers/calloutDataMapper';

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
    <div ref={ref}>
      {inView && !loading && callout ? (
        <PostCard
          post={mapCalloutDetailsToPostCard(callout)}
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
