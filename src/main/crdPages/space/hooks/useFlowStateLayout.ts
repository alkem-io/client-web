import { useSpaceTabsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  type FlowStateLayout,
  resolveFlowStateLayout,
} from '@/domain/collaboration/InnovationFlow/utils/resolveFlowStateLayout';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

/**
 * Resolves the per-phase layout settings for a callout based on its FLOW_STATE
 * classification tag value.
 *
 * Reads states from the already-cached `SpaceTabsQuery` (Apollo cache-first — zero
 * additional round-trips). The same query drives the tab strip for the current page, so
 * the states are guaranteed to be in cache when this hook runs.
 *
 * Space context resolution:
 *   Uses `subspace?.id || space?.id` (NOT `??`) — SubspaceContext defaults
 *   `subspace.id` to `''` (not `undefined`) at the space root, so `||` is required
 *   to fall through to the space id. With `??` the empty string sticks, the query is
 *   skipped, and every callout wrongly defaults to Expanded.
 *
 * Falls back to defaults (Expanded, publish details shown) for any miss.
 *
 * @param flowStateTagValue - The FLOW_STATE tagset value from the callout's classification.
 * @returns Resolved layout settings.
 */
export function useFlowStateLayout(flowStateTagValue: string | undefined | null): FlowStateLayout {
  const { space } = useSpace();
  const { subspace } = useSubSpace();

  // `||` not `??` — see JSDoc above.
  const spaceId = subspace?.id || space?.id;

  const { data } = useSpaceTabsQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !spaceId,
    fetchPolicy: 'cache-first',
  });

  const states = data?.lookup.space?.collaboration?.innovationFlow.states;

  return resolveFlowStateLayout(states, flowStateTagValue);
}
