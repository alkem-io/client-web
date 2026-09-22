import { useSpaceCollectionSubspacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import { mapSubspacesToCardDataList } from '@/main/crdPages/space/dataMappers/subspaceCardDataMapper';

/**
 * Data layer for a Spaces-collection callout, including the `expanded` arg that
 * drives the rich (expanded) card variant.
 *
 * Fetches the host space's subspaces for a SPACES callout via `framing.subspaces`
 * (the server returns the FULL authorized set, already ordered pinned-first then
 * the space's sortOrder/displayName — no server-side pagination/search) and maps
 * them through the existing `subspaceCardDataMapper` + `useSubspacesSorted` so the
 * card shape, order, and pin styling match the hard-coded `SpaceSubspacesList`
 * block this callout replaces (reuse, don't reinvent — FR-003/FR-007).
 *
 * The client name-searches + paginates client-side over the returned set inside
 * the reused `SpaceSubspacesList` (via the `SpaceCollection` renderer).
 *
 * Ordering: the server is authoritative (pinned-first). We still pass the set
 * through `useSubspacesSorted` in ALPHABETICAL mode — the mode under which the
 * subspaces tab shows pins — so the client re-sort is a no-op over the server
 * order and the pin indicator (`isPinned`, shown only for alphabetical sort)
 * renders exactly as it did on the replaced block.
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
  /** Mapped subspace cards in server order (pinned-first). Empty while `loading`. */
  subspaces: SpaceCardData[];
  /** Query loading state. */
  loading: boolean;
};

export function useCrdSpaceSubspaces(calloutId: string | undefined, expanded: boolean): UseCrdSpaceSubspacesResult {
  const { data, loading } = useSpaceCollectionSubspacesQuery({
    variables: { calloutId: calloutId ?? '', expanded },
    skip: !calloutId,
  });

  const rawSubspaces = loading ? [] : (data?.lookup.callout?.framing.subspaces ?? []);
  const sortedSubspaces = useSubspacesSorted(rawSubspaces, SpaceSortMode.Alphabetical);
  const subspaces = mapSubspacesToCardDataList(sortedSubspaces, SpaceSortMode.Alphabetical);

  return { subspaces, loading };
}
