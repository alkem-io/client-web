/**
 * useAccountSpaceCandidates (feature 084, T102)
 *
 * The candidate set for a Spaces-collection callout's manual (CUSTOM) selection:
 * every space of the HOST space's account, at any level, on which the editor
 * holds READ. Replaces 025's host-scoped `useSubspacesInSpaceQuery` source, which
 * could only offer the host's own direct subspaces (084 FR-010).
 *
 * `hostSpaceId` is ONE id, and it is both the query variable and the row the
 * callout lives on (contract S4). The connector's only space id is
 * `useUrlResolver().spaceId`, which already resolves "the current Space *or*
 * Subspace id, whichever the URL points at" — so a second parameter would only
 * create a way for the two to diverge, and a divergence makes `isHost` match no
 * row (the disabled "callout is here" row silently disappears) and computes the
 * badge set from the wrong root, with no gate able to see it.
 *
 * The query is gated `UPDATE` on the space (server T009), while the edit surface
 * that renders this picker is reachable with UPDATE on the CALLOUT alone (a
 * demoted creator keeps that via `USER_SELF_MANAGEMENT`). The caller must
 * therefore pass `skip` for a non-admin editor, who would otherwise see a
 * permission refusal presented as a transient load failure; the connector does
 * not render the manual-selection block for them at all (FR-009a).
 *
 * Everything below the fetch is pure client work over the one fetched set — no
 * server search surface, no server pagination, no second request per interaction
 * (FR-029). The React Compiler memoizes it.
 */
import type { ApolloError } from '@apollo/client';
import { useAccountSpaceCandidatesQuery } from '@/core/apollo/generated/apollo-hooks';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

/**
 * Joins a path into the sort key. A unit separator cannot occur in a display
 * name, so "Alpha" sorts immediately before "Alpha › Beta" and a branch stays
 * together.
 */
const PATH_SEPARATOR = '\u001f';

/** A readable ancestor of a candidate, as the path sub-line renders it. */
type AccountSpaceAncestor = {
  id: string;
  displayName: string;
};

type AccountSpaceCandidate = {
  id: string;
  displayName: string;
  /** L0 / L1 / L2 — the picker maps it to a label; this hook has no translator. */
  level: SpaceLevel;
  /**
   * The chain of READABLE ancestors, outermost first. Truncated to the readable
   * prefix when an ancestor is absent from the response: a hidden ancestor is
   * never replaced by a placeholder, because the placeholder would itself
   * disclose that it exists (contract S3).
   */
  ancestorPath: AccountSpaceAncestor[];
  /** The space the callout is hosted on — present, labelled, never selectable. */
  isHost: boolean;
  /** A descendant of the host space. False for the host's own row (spec FR-012b). */
  inHostTree: boolean;
  /** Another candidate carries the same display name (drives the chip context, FR-022). */
  hasNameClash: boolean;
};

type UseAccountSpaceCandidatesOptions = {
  /** The space the callout is hosted on — the query variable AND the host row. */
  hostSpaceId: string | undefined;
  /** Skip the fetch entirely (dialog closed, another framing chip, non-admin editor). */
  skip?: boolean;
};

export type UseAccountSpaceCandidatesResult = {
  /**
   * The candidate set, already ordered by ancestor path then display name
   * (FR-024): the picker renders an empty query as this whole list, in this
   * order, and must not re-sort it.
   */
  candidates: AccountSpaceCandidate[];
  loading: boolean;
  /**
   * An errored query must be distinguishable from a resolved empty one: a
   * consumer that destructures only `{ data, loading }` reads a failure as "this
   * account has no spaces" (FR-015/FR-026).
   */
  error: ApolloError | undefined;
  /**
   * Re-run the query. The save-failure path calls it so a rejected id loses its
   * candidate entry and renders as the unnamed "no longer available" chip, which
   * the admin removes with one explicit act before re-saving. It is NOT automatic
   * recovery: 025's client-side strip is deleted (FR-014, residual R-I).
   */
  refetch: () => void;
};

const sortKey = (candidate: AccountSpaceCandidate): string =>
  [...candidate.ancestorPath.map(ancestor => ancestor.displayName), candidate.displayName].join(PATH_SEPARATOR);

export function useAccountSpaceCandidates({
  hostSpaceId,
  skip = false,
}: UseAccountSpaceCandidatesOptions): UseAccountSpaceCandidatesResult {
  const { data, loading, error, refetch } = useAccountSpaceCandidatesQuery({
    variables: { spaceId: hostSpaceId ?? '' },
    skip: skip || !hostSpaceId,
  });

  const fetched = data?.lookup.space?.accountSpaces ?? [];
  const fetchedById = new Map(fetched.map(space => [space.id, space]));

  const nameCounts = new Map<string, number>();
  for (const space of fetched) {
    nameCounts.set(space.displayName, (nameCounts.get(space.displayName) ?? 0) + 1);
  }

  const candidates = fetched
    .map(space => {
      // Walk up from this candidate, outermost ancestor first. Every descendant
      // of the host is in the response — space UPDATE grants READ with
      // `cascade: true` and cascading rules are copied into every child policy —
      // so the only gap the walk can hit is an ancestor outside the host's tree.
      const ancestorPath: AccountSpaceAncestor[] = [];
      let parentId = space.parentSpaceID;
      while (parentId) {
        const parent = fetchedById.get(parentId);
        if (!parent) break;
        ancestorPath.unshift({ id: parent.id, displayName: parent.displayName });
        parentId = parent.parentSpaceID;
      }

      return {
        id: space.id,
        displayName: space.displayName,
        level: space.level,
        ancestorPath,
        isHost: space.id === hostSpaceId,
        inHostTree: ancestorPath.some(ancestor => ancestor.id === hostSpaceId),
        hasNameClash: (nameCounts.get(space.displayName) ?? 0) > 1,
      };
    })
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  return {
    candidates,
    loading,
    error,
    refetch: () => {
      void refetch();
    },
  };
}
