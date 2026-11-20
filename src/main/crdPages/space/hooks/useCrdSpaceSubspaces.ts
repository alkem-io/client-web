import { useSpaceCollectionSubspacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutSelectionMode, SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { sortSubspaces } from '@/domain/space/hooks/useSubspacesSorted';
import { mapSubspacesToCardDataList } from '@/main/crdPages/space/dataMappers/subspaceCardDataMapper';

/**
 * Data layer for a Spaces-collection callout, including the `expanded` arg that
 * drives the rich (expanded) card variant.
 *
 * Fetches the collection's spaces for a SPACES callout via `framing.subspaces`
 * (the server returns the FULL authorized set — no server-side pagination/search;
 * in AUTO mode already ordered pinned-first then sortOrder/displayName) and maps
 * them through the existing `subspaceCardDataMapper` + `sortSubspaces` so the
 * card shape and order match the hard-coded `SpaceSubspacesList` block this
 * callout replaces (reuse, don't reinvent).
 *
 * Both are plain functions on purpose: the React Compiler memoizes them on the
 * query data, so the mapped cards (and the excerpt visibility the mapper decides
 * for each) are computed once per fetch, not once per render.
 *
 * The client name-searches + paginates client-side over the returned set inside
 * the reused `SpaceSubspacesList` (via the `SpaceCollection` renderer).
 *
 * Ordering: this pass is the single ordering authority. In AUTO mode the server
 * order (pinned-first) is already alphabetical-compatible so the re-sort is a
 * no-op; in CUSTOM mode (feature 084) the server does not order the result at
 * all, so the same pass is what orders it.
 *
 * Pin indicator: `mapSubspacesToCardDataList` turns `isPinned` on only when it is
 * given `SpaceSortMode.Alphabetical`, whose documented meaning is "the PARENT
 * space's sort mode". In CUSTOM mode the selection spans parents, so there is no
 * parent space whose sort mode could apply and `pinned` — a parent-relative field
 * — has no meaning in this collection; we therefore pass no sort mode and the
 * badge is suppressed. AUTO is unchanged. `selectionMode` comes in as an argument
 * rather than being selected here: the callout's settings have one owner (the
 * `CalloutSettingsFull` selection of the mount site's own query), and a second,
 * partial `settings` write from this query would evict it from the cache.
 *
 * `expanded` drives the `$expanded` query variable that gates the
 * `SubspaceCardAboutContext` fragment (What/Why/Who) — a compact post never asks
 * for that extra About text. This hook deliberately never falls
 * back to Apollo's `previousData` when `expanded` flips: while the new variables
 * are loading it returns an empty, `loading: true` result so the caller shows its
 * loading state rather than briefly painting compact-looking cards that then jump
 * to expanded, or vice versa.
 */
export type UseCrdSpaceSubspacesResult = {
  /** Mapped subspace cards, alphabetically sorted. Empty while `loading`. */
  subspaces: SpaceCardData[];
  /**
   * Whether the server withheld at least one still-in-account manually selected
   * space from THIS viewer (feature 084, AC6). Always `false` in AUTO mode and
   * while `loading`.
   */
  hasHiddenSpaces: boolean;
  /** Query loading state. */
  loading: boolean;
};

export function useCrdSpaceSubspaces(
  calloutId: string | undefined,
  expanded: boolean,
  selectionMode: CalloutSelectionMode | undefined
): UseCrdSpaceSubspacesResult {
  const { data, loading } = useSpaceCollectionSubspacesQuery({
    variables: { calloutId: calloutId ?? '', expanded },
    skip: !calloutId,
  });

  const callout = loading ? undefined : data?.lookup.callout;
  const isCustom = selectionMode === CalloutSelectionMode.Custom;
  const sortedSubspaces = sortSubspaces(callout?.framing.subspaces ?? [], SpaceSortMode.Alphabetical);
  const subspaces = mapSubspacesToCardDataList(sortedSubspaces, isCustom ? undefined : SpaceSortMode.Alphabetical);

  return { subspaces, hasHiddenSpaces: callout?.hasHiddenSpaces ?? false, loading };
}
