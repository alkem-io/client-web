import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import type { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';

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

export type PollOptionMutations = Pick<
  ReturnType<typeof usePollOptionManagement>,
  'addOption' | 'removeOption' | 'updateOption' | 'reorderOptions'
>;

/**
 * The poll as the server holds it after the mutations applied so far, plus the form options with the
 * server ids of newly added options stamped in. Diffing `after` against `before` yields exactly the
 * work that is still outstanding, so a retry after a partial failure resumes instead of repeating.
 */
export type PollOptionDiffProgress = { before: PollOptionBefore[]; after: PollOptionValue[] };

/**
 * Persists the option edits of an existing poll through the dedicated poll-option
 * mutations, in the `diffPollOptions` order: adds → removes → updates → reorder
 * (added options are slotted into the reorder by the ids the server returned).
 * Shared by the live Post editor and the callout-template editor. Throws on the
 * first failing mutation; the caller decides how to surface it. `onProgress` fires
 * after every mutation that succeeded, so a caller that retries can pick up from
 * the poll's current state rather than the one it started with.
 */
export const applyPollOptionDiff = async (
  mutations: PollOptionMutations,
  before: PollOptionBefore[],
  after: PollOptionValue[],
  onProgress?: (progress: PollOptionDiffProgress) => void
): Promise<void> => {
  const diff = diffPollOptions(before, after);
  if (!diff.toAdd.length && !diff.toRemove.length && !diff.toUpdate.length && !diff.orderedIds.length) {
    return;
  }

  let current = before;
  let desired = after;
  const report = () => onProgress?.({ before: current, after: desired });

  // 1. Adds (before removes — never drop below the server's min).
  const addedIdsByIndex = new Map<number, string>();
  const knownIds = new Set(before.map(o => o.id));
  for (const add of diff.toAdd) {
    const res = await mutations.addOption(add.text);
    const addedPoll = res.data?.addPollOption;
    if (addedPoll) {
      const newOpt = addedPoll.options.find(o => !knownIds.has(o.id));
      if (newOpt) {
        addedIdsByIndex.set(add.index, newOpt.id);
        knownIds.add(newOpt.id);
        current = [...current, { id: newOpt.id, text: add.text }];
        desired = desired.map((opt, index) => (index === add.index ? { ...opt, id: newOpt.id } : opt));
        report();
      }
    }
  }
  // 2. Removes.
  for (const id of diff.toRemove) {
    await mutations.removeOption(id);
    current = current.filter(o => o.id !== id);
    report();
  }
  // 3. Updates.
  for (const upd of diff.toUpdate) {
    await mutations.updateOption(upd.id, upd.text);
    current = current.map(o => (o.id === upd.id ? { ...o, text: upd.text } : o));
    report();
  }
  // 4. Reorder — substitute sentinels with their resolved server ids.
  if (diff.orderedIds.length > 1) {
    const resolved = diff.orderedIds
      .map(id => {
        if (!isAddedSentinel(id)) return id;
        const idx = parseAddedSentinel(id);
        return idx !== undefined ? addedIdsByIndex.get(idx) : undefined;
      })
      .filter((v): v is string => Boolean(v));
    if (resolved.length > 1) await mutations.reorderOptions(resolved);
  }
};
