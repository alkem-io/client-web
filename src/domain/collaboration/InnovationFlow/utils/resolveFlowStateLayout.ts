import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';

/**
 * Per-phase layout settings resolved for the feed.
 * `descriptionCollapsed: true` means posts start collapsed with a read-more affordance.
 * `showPublishDetails: false` means publisher name, avatar, and publish date are hidden.
 */
export type FlowStateLayout = {
  descriptionCollapsed: boolean;
  showPublishDetails: boolean;
  /** POC: when true, the state's callouts render as a searchable forum table instead of the feed. */
  forumMode: boolean;
};

/** FR-006 defaults: fail toward pre-feature behaviour, never toward hiding content. */
const DEFAULTS: FlowStateLayout = {
  descriptionCollapsed: false,
  showPublishDetails: true,
  forumMode: false,
};

/**
 * Minimal shape of an InnovationFlowState that carries layout settings.
 * Using a narrow structural type so callers can pass any wider object (e.g. the full
 * Apollo-generated state) without casting.
 */
type StateWithLayout = {
  displayName: string;
  settings?: {
    descriptionDisplayMode?: CalloutDescriptionDisplayMode | null;
    showPublishDetails?: boolean | null;
    forumMode?: boolean | null;
  } | null;
};

/**
 * Resolves the per-phase layout for a callout based on its FLOW_STATE classification
 * tag value. This is the ONLY implementation of the displayName-join in the codebase.
 *
 * Match rule: `state.displayName === flowStateTagValue` (exact, case-sensitive —
 * the tag is set by the server's rename cascade so it always matches the display name).
 *
 * Fallback (FR-006): any miss — undefined/empty tag, undefined/empty states, no
 * matching state, missing settings keys — returns the defaults:
 *   { descriptionCollapsed: false, showPublishDetails: true }
 *
 * ENUM TRAP: `descriptionDisplayMode` on the wire is the GraphQL enum NAME string
 * (e.g. `"COLLAPSED"`). Compare ONLY via the generated `CalloutDescriptionDisplayMode`
 * enum, never against a lowercase literal — a lowercase `'collapsed'` check would
 * silently never match and every callout would appear Expanded regardless of the
 * admin's setting.
 *
 * @param states   - The innovation flow's states list from the Apollo cache.
 * @param flowStateTagValue - The FLOW_STATE tagset value from the callout's classification.
 * @returns Resolved layout settings, or DEFAULTS on any miss.
 */
export function resolveFlowStateLayout(
  states: ReadonlyArray<StateWithLayout> | undefined | null,
  flowStateTagValue: string | undefined | null
): FlowStateLayout {
  if (!states || states.length === 0) return DEFAULTS;
  if (!flowStateTagValue) return DEFAULTS;

  const matchedState = states.find(s => s.displayName === flowStateTagValue);
  if (!matchedState) return DEFAULTS;

  const settings = matchedState.settings;
  if (!settings) return DEFAULTS;

  const descriptionCollapsed = settings.descriptionDisplayMode === CalloutDescriptionDisplayMode.Collapsed;
  // Defensive: treat null/undefined as the default (true = show details).
  const showPublishDetails = settings.showPublishDetails !== false;
  // POC: forum layout is opt-in per state; only an explicit true switches it on.
  const forumMode = settings.forumMode === true;

  return { descriptionCollapsed, showPublishDetails, forumMode };
}
