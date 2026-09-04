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
 * The mapper owns the client-visible dedup: a single callout can be returned more
 * than once across paginated fetches (it matches via more than one contained
 * document — its own framing doc AND a post/whiteboard/memo — and the server folds
 * per page, not across pages). Left unchecked that would render the same callout
 * card twice and inflate the "N items match" count (R3, count = distinct callouts).
 * So we dedup by callout id here, keeping the first occurrence (highest relevance,
 * server order preserved — FR-019). Order is otherwise the server's; this mapper
 * never sorts, and filters only the type guard + the dedup.
 */
export function mapFlowStateSearchCalloutIds(
  results: FlowStateSearchQuery['search']['calloutResults']['results']
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const r of results) {
    if (r.type !== SearchResultType.Callout) {
      continue;
    }
    const id = (r as CalloutResult).callout.id;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}
