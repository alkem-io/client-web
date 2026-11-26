import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import type { CrdFeedCallout } from '../hooks/useCrdCalloutList';
import { LazyCalloutItem } from './LazyCalloutItem';

type CalloutListConnectorProps = {
  title?: string;
  /** The feed's posts in server order (021 FR-007); every card renders from its own PostCard. */
  callouts: CrdFeedCallout[];
  calloutsSetId: string | undefined;
  canCreate?: boolean;
  /** Set-level Update privilege — gates the per-callout move/reorder menu items. */
  canReorder?: boolean;
  loading?: boolean;
  onCreateClick?: () => void;
};

export function CalloutListConnector({
  title,
  callouts,
  calloutsSetId,
  canCreate,
  canReorder,
  loading,
  onCreateClick,
}: CalloutListConnectorProps) {
  // The move-actions hook (plan D9 / T066) needs the ordered id list to
  // derive each callout's top/bottom neighbour state. We compute it once here
  // and pass it through so every item shares the same view of the feed.
  const orderedCalloutIds = callouts.map(c => c.id);

  return (
    <SpaceFeed
      title={title}
      canCreate={canCreate}
      onCreateClick={onCreateClick}
      loading={loading && callouts.length === 0}
    >
      {callouts.map(callout => (
        <LazyCalloutItem
          key={callout.id}
          calloutId={callout.id}
          calloutsSetId={calloutsSetId}
          orderedCalloutIds={orderedCalloutIds}
          canReorder={canReorder}
        />
      ))}
    </SpaceFeed>
  );
}
