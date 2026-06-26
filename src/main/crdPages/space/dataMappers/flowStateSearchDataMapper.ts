import { type FlowStateSearchQuery, SearchResultType } from '@/core/apollo/generated/graphql-schema';

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
