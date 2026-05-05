import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';

export type PollOptionBefore = { id: string; text: string };

export type PollOptionDiff = {
  /** New options in the order they should be added. Each entry carries the form-row index so the caller can slot the returned server id back into place for reordering. */
  toAdd: { index: number; text: string }[];
  /** Server ids whose corresponding option was removed from the form. */
  toRemove: string[];
  /** Existing options whose text changed. */
  toUpdate: { id: string; text: string }[];
  /**
   * Ordered id list for `reorderPollOptions`. Contains `'__ADDED__:<index>'`
   * sentinels where a newly-added option should slot in — the caller
   * substitutes the real server ids once the `addOption` mutation resolves.
   * Length 0 or 1 means no reorder is needed.
   */
  orderedIds: string[];
};

const ADDED_SENTINEL = '__ADDED__:';

export const addedSentinel = (index: number): string => `${ADDED_SENTINEL}${index}`;
export const isAddedSentinel = (id: string): boolean => id.startsWith(ADDED_SENTINEL);
export const parseAddedSentinel = (id: string): number | undefined => {
  if (!isAddedSentinel(id)) return undefined;
  const idx = Number.parseInt(id.slice(ADDED_SENTINEL.length), 10);
  return Number.isFinite(idx) ? idx : undefined;
};

/**
 * Pure diff between the poll's original options (from the server) and the
 * current form state. Mirrors the MUI `EditCalloutDialog.savePollOptionChanges`
 * algorithm (spec plan D7).
 *
 * Ordering invariant: `toAdd` → `toRemove` → `toUpdate` → optional reorder.
 * Adding first guarantees the poll never dips below the server's minimum
 * option count between mutations.
 */
export const diffPollOptions = (before: PollOptionBefore[], after: PollOptionValue[]): PollOptionDiff => {
  const beforeIds = new Set(before.map(o => o.id));
  const afterIds = new Set<string>();
  for (const o of after) if (o.id) afterIds.add(o.id);

  const toAdd: PollOptionDiff['toAdd'] = [];
  after.forEach((opt, idx) => {
    if (!opt.id && opt.text.trim().length > 0) {
      toAdd.push({ index: idx, text: opt.text });
    }
  });

  const toRemove = before.filter(o => !afterIds.has(o.id)).map(o => o.id);

  const toUpdate: PollOptionDiff['toUpdate'] = [];
  for (const opt of after) {
    if (opt.id && beforeIds.has(opt.id)) {
      const orig = before.find(o => o.id === opt.id);
      if (orig && orig.text !== opt.text) {
        toUpdate.push({ id: opt.id, text: opt.text });
      }
    }
  }

  const orderedIds = after
    .map((opt, idx) => {
      if (opt.id) return opt.id;
      if (opt.text.trim().length > 0) return addedSentinel(idx);
      return undefined;
    })
    .filter((v): v is string => v !== undefined);

  const existingInBeforeOrder = before.filter(o => afterIds.has(o.id)).map(o => o.id);
  const orderChanged =
    orderedIds.length !== existingInBeforeOrder.length ||
    orderedIds.some((id, i) => {
      if (isAddedSentinel(id)) return true;
      return id !== existingInBeforeOrder[i];
    });

  return {
    toAdd,
    toRemove,
    toUpdate,
    orderedIds: orderChanged && orderedIds.length > 1 ? orderedIds : [],
  };
};
