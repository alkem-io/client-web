import type { InnovationFlowSettingsQuery } from '@/core/apollo/generated/graphql-schema';
import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';
import type {
  LayoutCallout,
  LayoutPoolColumn,
  PhaseLayoutInput,
} from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import { resolveSidebarPlan } from '@/main/crdPages/space/layout/sidebarWidgetPlan';

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
    profileUrl: callout.framing.profile.url ?? '',
  };
}

export type SpaceLevelTag = 'L0' | 'L1' | 'L2';

/** The number of fixed, built-in tabs on an L0 Space (Dashboard, Community, Subspaces, Knowledge Base). */
const L0_PROTECTED_TAB_COUNT = 4;

export function mapCollaborationToLayoutColumns(
  collaboration: LayoutCollaboration,
  level: SpaceLevelTag
): LayoutPoolColumn[] {
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

  return states.map((state, index) =>
    mapStateToColumn(state, sortedByState.get(state.displayName) ?? [], currentStateId, isDeletableTab(level, index))
  );
}

/**
 * On an L0 Space the first four tabs (Dashboard, Community, Subspaces, Knowledge Base — indices
 * 0–3 by sort order) are built-in and protected from deletion; tabs at index ≥ 4 are admin-added
 * and deletable. On subspaces (L1/L2) every phase is deletable (the flow's min-states limit, not
 * position, governs removal), so we return `true` for them.
 */
function isDeletableTab(level: SpaceLevelTag, index: number): boolean {
  return level === 'L0' ? index >= L0_PROTECTED_TAB_COUNT : true;
}

function mapStateToColumn(
  state: RawState,
  callouts: LayoutCallout[],
  currentStateId: string | null,
  isDeletable: boolean
): LayoutPoolColumn {
  const defaultCalloutTemplate = state.defaultCalloutTemplate
    ? { id: state.defaultCalloutTemplate.id, displayName: state.defaultCalloutTemplate.profile.displayName }
    : null;

  return {
    id: state.id,
    title: state.displayName,
    description: state.description ?? '',
    isCurrentPhase: state.id === currentStateId,
    isHidden: readIsHidden(state),
    isDeletable,
    layout: readPhaseLayout(state),
    defaultCalloutTemplate,
    callouts,
  };
}

/**
 * Derives the column's `isHidden` flag from the state's `settings.visible`.
 *
 * `visible` is not yet in the generated GraphQL types (it ships with server#6138 and the
 * regenerated `apollo-hooks.ts`). Until then it is simply absent from responses, so we read
 * it defensively: `undefined` when the field is absent → `isHidden` is `undefined`, which
 * suppresses the Hide/Show affordance (graceful degradation). `visible === false` → hidden.
 */
function readIsHidden(state: RawState): boolean | undefined {
  const visible = (state.settings as { visible?: boolean } | undefined)?.visible;
  return typeof visible === 'boolean' ? !visible : undefined;
}

/**
 * Reads the per-phase layout settings for pre-filling the Layout modal.
 *
 * Defensive read: `descriptionDisplayMode` and `showPublishDetails` are widened
 * fields (added in this feature, may be absent before server wave 1 deploys).
 * Returns `undefined` for the whole layout when neither field is present so callers
 * can gracefully degrade. When present, converts to the UI model:
 *   `descriptionDisplayMode === COLLAPSED` → `descriptionCollapsed: true`
 *   `showPublishDetails !== false` → `showPublishDetails: true` (null/undefined → true)
 */
function readPhaseLayout(state: RawState): PhaseLayoutInput | undefined {
  // Defensive: `state.settings` may be absent when the server wave 1 hasn't
  // deployed yet or when test fixtures omit it (the TypeScript cast on test
  // data does not enforce presence at runtime).
  const settings =
    (state.settings as
      | {
          descriptionDisplayMode?: CalloutDescriptionDisplayMode | null;
          showPublishDetails?: boolean | null;
          sidebar?: string[] | null;
        }
      | undefined) ?? {};
  if (settings.descriptionDisplayMode === undefined && settings.showPublishDetails === undefined) {
    return undefined;
  }
  return {
    descriptionCollapsed: settings.descriptionDisplayMode === CalloutDescriptionDisplayMode.Collapsed,
    showPublishDetails: settings.showPublishDetails !== false,
    // Unknown wire values dropped, duplicates removed, order preserved (FR-013/FR-006) —
    // defence-in-depth mirror of the server's own read-side normalization.
    sidebar: resolveSidebarPlan(settings.sidebar),
  };
}
