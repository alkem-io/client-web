import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import type { CrdFeedCallout } from '../hooks/useCrdCalloutList';
import { useFlowStateLayout } from '../hooks/useFlowStateLayout';
import { ForumViewConnector } from './ForumViewConnector';
import { LazyCalloutItem } from './LazyCalloutItem';

type CalloutListConnectorProps = {
  title?: string;
  // The feed reads only id + sortOrder; each card lazy-loads its own content.
  callouts: CrdFeedCallout[];
  calloutsSetId: string | undefined;
  canCreate?: boolean;
  /** Set-level Update privilege — gates the per-callout move/reorder menu items. */
  canReorder?: boolean;
  loading?: boolean;
  onCreateClick?: () => void;
  /**
   * Forum mode (POC): the display name of the flow state this list belongs to.
   * When that state has `forumMode` on, the list renders as a searchable forum
   * table instead of the feed. Omitting it keeps the default feed.
   */
  flowStateDisplayName?: string;
};

export function CalloutListConnector({
  title,
  callouts,
  calloutsSetId,
  canCreate,
  canReorder,
  loading,
  onCreateClick,
  flowStateDisplayName,
}: CalloutListConnectorProps) {
  // Resolve the state's layout from the cached SpaceTabsQuery (zero extra round-trips).
  const { forumMode } = useFlowStateLayout(flowStateDisplayName);

  if (forumMode && calloutsSetId && flowStateDisplayName) {
    // A space tab IS a flow state; its callouts are classified by the FLOW_STATE
    // tagset carrying the state's display name — the same scoping the feed uses.
    const classificationTagsets = [{ name: TagsetReservedName.FlowState, tags: [flowStateDisplayName] }];
    return <ForumViewConnector calloutsSetId={calloutsSetId} classificationTagsets={classificationTagsets} />;
  }

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
          canReorder={canReorder}
        />
      ))}
    </SpaceFeed>
  );
}
