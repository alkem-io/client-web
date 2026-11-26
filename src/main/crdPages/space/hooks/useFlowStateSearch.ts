import type { FlowStateSearchQuery } from '@/core/apollo/generated/graphql-schema';
import type { FlowStateSearchStatus } from '@/crd/components/search/FlowStateSearchResults';

type CalloutResultItems = FlowStateSearchQuery['search']['calloutResults']['results'];

export type UseFlowStateSearchParams = {
  /**
   * The viewed InnovationFlowState UUID. Its globally-unique UUID
   * transitively pins the Collaboration, so no separate CalloutsSet scope is
   * needed.
   */
  flowStateID: string | undefined;
  /**
   * The current L0 Space UUID — hard-scopes callout documents to the Space
   * tree. The flow-state filter alone is "absent OR equals": a callout whose
   * search document was never stamped with a flow state would otherwise
   * match every flow-state-scoped search across the whole platform: this
   * bounds that soft leak to the current Space.
   */
  spaceID?: string;
  /**
   * The active query terms: `[]` (browse) or exactly ONE joined term built
   * from the applied text and the selected tags — never split into words.
   */
  terms: string[];
  /** Skip while the scope UUIDs are not yet resolved. */
  skip?: boolean;
};

export type UseFlowStateSearchResult = {
  status: FlowStateSearchStatus;
  results: CalloutResultItems;
  /** True while a subsequent page is appended (prior results stay visible, FR-023). */
  appending: boolean;
  /** True while a cursor remains, i.e. more pages may exist (FR-013). */
  hasMore: boolean;
  /** Intersection-observer sentinel ref — attach to the end-of-list marker. */
  sentinelRef: (node?: Element | null) => void;
  /** Re-issue the current request after a failure (FR-021). */
  retry: () => void;
};

const NO_RESULTS: CalloutResultItems = [];
const noop = () => {};

/**
 * Per-flow-state scoped search. Its native read is WP-SRCH1's `search` root, not served yet (021 DEP-021-SEARCH),
 * so a search shows the existing inline error state with its retry and sends no request; browsing shows no results.
 */
export function useFlowStateSearch({ flowStateID, skip }: UseFlowStateSearchParams): UseFlowStateSearchResult {
  return {
    status: skip || !flowStateID ? 'empty' : 'error',
    results: NO_RESULTS,
    appending: false,
    hasMore: false,
    sentinelRef: noop,
    retry: noop,
  };
}
