import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import type { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';
import { LazyCalloutItem } from './LazyCalloutItem';

type CalloutListConnectorProps = {
  title?: string;
  callouts: CalloutModelLightExtended[];
  calloutsSetId: string | undefined;
  canCreate?: boolean;
  loading?: boolean;
  onCreateClick?: () => void;
};

export function CalloutListConnector({
  title,
  callouts,
  calloutsSetId,
  canCreate,
  loading,
  onCreateClick,
}: CalloutListConnectorProps) {
  const sorted = [...callouts].sort((a, b) => a.sortOrder - b.sortOrder);
  // The move-actions hook (plan D9 / T066) needs the ordered id list to
  // derive each callout's top/bottom neighbour state. We compute it once here
  // and pass it through so every item shares the same view of the feed.
  const orderedCalloutIds = sorted.map(c => c.id);

  return (
    <SpaceFeed
      title={title}
      canCreate={canCreate}
      onCreateClick={onCreateClick}
      loading={loading && callouts.length === 0}
    >
      {sorted.map(callout => (
        <LazyCalloutItem
          key={callout.id}
          calloutId={callout.id}
          calloutsSetId={calloutsSetId}
          orderedCalloutIds={orderedCalloutIds}
        />
      ))}
    </SpaceFeed>
  );
}
