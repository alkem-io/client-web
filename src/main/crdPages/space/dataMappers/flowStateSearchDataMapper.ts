import { type FlowStateSearchQuery, SearchResultType } from '@/core/apollo/generated/graphql-schema';

/**
 * Builds the search request's `terms` array from the sidebar widget's free
 * text and selected tags: everything is joined into exactly ONE term, mirroring
 * what the search service does internally before it evaluates its terms-count
 * limit (it re-joins with spaces). Joining here rather than sending one term
 * per tag means that limit can never be hit regardless of tag count, and a
 * selected tag can never be silently dropped by a clamp.
 */
export function buildFlowStateSearchTerms(appliedText: string, tags: readonly string[]): string[] {
  const joined = [appliedText.trim(), ...tags].filter(Boolean).join(' ');
  return joined ? [joined] : [];
}

type CalloutResult = Extract<
  NonNullable<FlowStateSearchQuery['search']['calloutResults']['results'][number]>,
  { __typename?: 'SearchResultCallout' }
>;

/**
 * Extracts the matched callout UUIDs from the server-folded, callout-level search
 * results (`calloutResults`). The unit of a result is the containing callout
 * (FR-017), and the scoped tab renders matches through the **default** callout
 * feed (`LazyCalloutItem`) rather than a bespoke search card — so all the mapper
 * needs to surface is each callout's id, in the server's relevance order.
 *
 * The list is already deduped to one callout per match server-side; this mapper
 * only reshapes — it never filters (beyond the type guard) or sorts (ordering is
 * the server's, FR-019).
 */
export function mapFlowStateSearchCalloutIds(
  results: FlowStateSearchQuery['search']['calloutResults']['results']
): string[] {
  return results
    .filter((r): r is CalloutResult => r.type === SearchResultType.Callout)
    .map(result => result.callout.id);
}
