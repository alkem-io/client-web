import type { InnovationFlowSettingsQuery } from '@/core/apollo/generated/graphql-schema';
import type { LayoutCallout, LayoutPoolColumn } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';

export type { LayoutCallout, LayoutPoolColumn };

export type LayoutCollaboration = NonNullable<InnovationFlowSettingsQuery['lookup']['collaboration']>;

type RawCallout = LayoutCollaboration['calloutsSet']['callouts'][number];
type RawState = LayoutCollaboration['innovationFlow']['states'][number];

/**
 * Group callouts under their innovation-flow state via the
 * `classification.flowState.tags[0]` string match.
 *
 * Callouts without a flowState or whose tag doesn't match any state are
 * silently ignored (backend contract guarantees every callout carries a
 * valid tag; the fallback protects against mid-migration data).
 */
function calloutToLayoutCallout(callout: RawCallout): LayoutCallout | null {
  const tagset = callout.classification?.flowState;
  if (!tagset) return null;
  return {
    id: callout.id,
    title: callout.framing.profile.displayName,
    description: '', // CalloutsSet query doesn't include description; left empty in the buffer, won't be edited here.
    flowStateTagsetId: tagset.id,
  };
}

export function mapCollaborationToLayoutColumns(collaboration: LayoutCollaboration): LayoutPoolColumn[] {
  const { innovationFlow, calloutsSet } = collaboration;
  const states = [...innovationFlow.states].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentStateId = innovationFlow.currentState?.id ?? null;

  const byStateName = new Map<string, Array<{ mapped: LayoutCallout; sortOrder: number }>>();
  for (const callout of calloutsSet.callouts) {
    const mapped = calloutToLayoutCallout(callout);
    if (!mapped) continue;
    const raw = callout.classification?.flowState;
    const stateName = raw?.tags[0];
    if (!stateName) continue;
    const arr = byStateName.get(stateName) ?? [];
    arr.push({ mapped, sortOrder: callout.sortOrder });
    byStateName.set(stateName, arr);
  }

  // Sort callouts in each column by their backend sortOrder.
  const sortedByState = new Map<string, LayoutCallout[]>();
  for (const [name, entries] of byStateName) {
    sortedByState.set(
      name,
      [...entries].sort((a, b) => a.sortOrder - b.sortOrder).map(e => e.mapped)
    );
  }

  return states.map(state => mapStateToColumn(state, sortedByState.get(state.displayName) ?? [], currentStateId));
}

function mapStateToColumn(state: RawState, callouts: LayoutCallout[], currentStateId: string | null): LayoutPoolColumn {
  return {
    id: state.id,
    title: state.displayName,
    description: state.description ?? '',
    isCurrentPhase: state.id === currentStateId,
    callouts,
  };
}
