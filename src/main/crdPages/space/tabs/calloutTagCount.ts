import { countBy } from 'lodash-es';

/**
 * Per-callout shape this helper reads: only the user-authored tag list on the framing profile.
 * Classification tagsets (FLOW_STATE / Innovation Flow) live on `callout.classification.tagsets`
 * and are intentionally NOT counted here — the tag cloud's `CalloutsSetTags` query also reads
 * only the framing default tagset (see `src/domain/collaboration/calloutsSet/tagCloud/CalloutsSetTags.graphql`).
 */
export type CalloutWithFramingTags = {
  framing: {
    profile: {
      tagset?: { tags: string[] } | null | undefined;
    };
  };
};

/**
 * Tally `framing.profile.tagset.tags` occurrences across a list of callouts.
 *
 * Used by `CrdSpaceCustomTabPage` (Knowledge Base tab) to power per-tag counts in `CalloutTagCloud`.
 * The input is the **currently visible (filtered) callouts array** — so counts always reflect
 * "if I were to add this tag to the current filter the post-filter result would be N", which is
 * the faceted-filter semantic users expect. Tags absent from the visible set get `0` legitimately.
 *
 * Mirrors the `countBy` pattern used by
 * `src/domain/shared/components/SearchTagsInput/uniqSortedByOccurrences.ts`.
 */
export function countTagOccurrences(callouts: ReadonlyArray<CalloutWithFramingTags>): Record<string, number> {
  if (callouts.length === 0) return {};
  const flat: string[] = [];
  for (const callout of callouts) {
    const tags = callout.framing.profile.tagset?.tags;
    if (!tags) continue;
    for (const t of tags) flat.push(t);
  }
  return countBy(flat);
}
