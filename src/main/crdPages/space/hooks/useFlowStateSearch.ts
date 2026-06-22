import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFlowStateSearchQuery } from '@/core/apollo/generated/apollo-hooks';
import { type FlowStateSearchQuery, SearchCategory, SearchResultType } from '@/core/apollo/generated/graphql-schema';
import type { FlowStateSearchStatus } from '@/crd/components/search/FlowStateSearchResults';

/** Page size for the scoped surface (FR-006 / SC-004). */
const PAGE_SIZE = 10;

type CalloutResults = FlowStateSearchQuery['search']['calloutResults'];
type CalloutResultItems = CalloutResults['results'];

export type UseFlowStateSearchParams = {
  /**
   * The viewed InnovationFlowState UUID — the sole scope (FR-008/012). Its
   * globally-unique UUID transitively pins the Collaboration, so no separate
   * CalloutsSet scope is needed.
   */
  flowStateID: string | undefined;
  /**
   * The active query terms: the submitted free-text term split into words PLUS
   * each selected tag pill (FR-004). An empty array is browse mode (FR-018) —
   * still a valid scoped request, served paginated.
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

const concat = (a: CalloutResultItems = [], b: CalloutResultItems = []): CalloutResultItems => [...a, ...b];

/**
 * Generic per-flow-state scoped search (007-knowledge-base-search). Not
 * KB-specific — any flow state on any L0 tab drives it via the flow-state UUID
 * prop (FR-011). Mirrors the global-search paging machinery (FR-016):
 * `fetchPolicy: 'no-cache'`, `fetchMore` with a manual `updateQuery` concat
 * merge, end-of-results driven off cursor presence (never a count — `total` is
 * always -1), and a fresh page-1 reset that discards in-flight pages of a prior
 * term/tag set (FR-022, latest-wins).
 */
export function useFlowStateSearch({ flowStateID, terms, skip }: UseFlowStateSearchParams): UseFlowStateSearchResult {
  const shouldSkip = skip || !flowStateID;

  // A stable signature for the current term/tag set. When it changes, the query
  // variables change, Apollo issues a fresh page-1 query, and any in-flight
  // fetchMore from the previous signature is invalidated by `requestKeyRef`
  // (latest-wins, FR-022).
  const requestKey = `${flowStateID ?? ''}|${terms.join(' ')}`;
  const requestKeyRef = useRef(requestKey);
  // Sync the latest-wins signature inside an effect (never during render).
  useEffect(() => {
    requestKeyRef.current = requestKey;
  }, [requestKey]);

  const [appending, setAppending] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useFlowStateSearchQuery({
    variables: {
      searchData: {
        terms,
        searchInFlowStateFilter: flowStateID,
        filters: [
          {
            category: SearchCategory.CollaborationTools,
            size: PAGE_SIZE,
            types: [SearchResultType.Callout],
            cursor: undefined,
          },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    skip: shouldSkip,
  });

  // Reset the append flag whenever the term/tag set changes — a new page-1 load
  // is a skeleton (FR-023), not an append.
  useEffect(() => {
    setAppending(false);
  }, [requestKey]);

  const results = data?.search.calloutResults.results ?? [];
  const cursor = data?.search.calloutResults.cursor;
  const hasMore = Boolean(cursor);

  // Distinguish a first-page load (skeleton) from a subsequent append (footer
  // spinner): if we already hold results, an in-flight network call is an
  // append; otherwise it is the first page.
  const firstPageLoading = loading && results.length === 0;

  let status: FlowStateSearchStatus = 'results';
  if (error && results.length === 0) {
    // Only a hard failure with nothing on screen is the inline error state.
    // A failure mid-scroll keeps prior results visible (FR-021) — the footer
    // spinner simply stops and the loaded pages remain.
    status = 'error';
  } else if (firstPageLoading) {
    status = 'loading';
  } else if (results.length === 0) {
    status = 'empty';
  }

  // Infinite scroll (FR-013): auto-load the next page as the sentinel nears view.
  // The load is inlined in the effect with complete dependencies so the rules of
  // React (and the React Compiler) hold without disabling any lint rule.
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '200px', delay: 100 });
  useEffect(() => {
    if (!inView || shouldSkip || !cursor || appending || loading) {
      return;
    }
    const keyAtRequest = requestKeyRef.current;
    setAppending(true);
    fetchMore({
      variables: {
        searchData: {
          terms,
          searchInFlowStateFilter: flowStateID,
          filters: [
            {
              category: SearchCategory.CollaborationTools,
              size: PAGE_SIZE,
              types: [SearchResultType.Callout],
              cursor,
            },
          ],
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        // Latest-wins (FR-022): if the term/tag set changed while this page was
        // in flight, drop it — never merge stale pages into the new query.
        if (keyAtRequest !== requestKeyRef.current || !fetchMoreResult) {
          return prev;
        }
        return {
          search: {
            ...prev.search,
            calloutResults: {
              ...fetchMoreResult.search.calloutResults,
              results: concat(prev.search.calloutResults.results, fetchMoreResult.search.calloutResults.results),
            },
          },
        };
      },
    })
      .catch(() => {
        // Append failure keeps prior results; the footer spinner simply stops.
      })
      .finally(() => {
        if (keyAtRequest === requestKeyRef.current) {
          setAppending(false);
        }
      });
  }, [inView, shouldSkip, cursor, appending, loading, terms, flowStateID, fetchMore]);

  const retry = () => {
    void refetch();
  };

  return {
    status,
    results,
    appending,
    hasMore,
    sentinelRef,
    retry,
  };
}
