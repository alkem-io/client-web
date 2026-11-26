import {
  type FlowStateLayout,
  resolveFlowStateLayout,
} from '@/domain/collaboration/InnovationFlow/utils/resolveFlowStateLayout';

/**
 * Resolves the per-phase layout settings for a callout based on its FLOW_STATE classification tag value.
 *
 * The per-stage layout is `Stage.settings`, which the server does not serve yet (021 tasks.md S01), so every callout
 * gets legacy's defaults for a miss (Expanded, publish details shown), with no request.
 *
 * @param flowStateTagValue - The FLOW_STATE tagset value from the callout's classification.
 * @returns Resolved layout settings.
 */
export function useFlowStateLayout(flowStateTagValue: string | undefined | null): FlowStateLayout {
  return resolveFlowStateLayout(undefined, flowStateTagValue);
}
