import { type FlowStateSearchQuery, SearchResultType } from '@/core/apollo/generated/graphql-schema';
import type { PostResultCardData } from '@/crd/components/search/PostResultCard';

type CalloutResult = Extract<
  NonNullable<FlowStateSearchQuery['search']['calloutResults']['results'][number]>,
  { __typename?: 'SearchResultCallout' }
>;

/**
 * Maps the server-folded, callout-level search results (`calloutResults`) to the
 * card props the global-search `PostResultCard` consumes (FR-016 — same result
 * presentation). The unit of a result is the containing callout (FR-017), so the
 * card title/href come from the callout's framing profile.
 *
 * The result list is already deduped to one callout per match server-side; this
 * mapper only reshapes — it never filters or sorts (ordering is the server's,
 * FR-019).
 */
export function mapFlowStateSearchResults(
  results: FlowStateSearchQuery['search']['calloutResults']['results'],
  unknownAuthorLabel: string
): PostResultCardData[] {
  return results
    .filter((r): r is CalloutResult => r.type === SearchResultType.Callout)
    .map(result => {
      const authorSource = result.callout.publishedBy ?? result.callout.createdBy;
      return {
        id: result.id,
        title: result.callout.framing.profile.displayName,
        snippet: result.callout.framing.profile.description ?? '',
        type: 'post' as const,
        bannerUrl: undefined,
        author: {
          name: authorSource?.profile?.displayName ?? unknownAuthorLabel,
          avatarUrl: authorSource?.profile?.avatar?.uri,
        },
        date: '',
        spaceName: result.space.about.profile.displayName,
        href: result.callout.framing.profile.url,
      };
    });
}
