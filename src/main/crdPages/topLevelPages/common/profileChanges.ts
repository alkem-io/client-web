/**
 * Shared Save plumbing for the User / Organization / VC Profile tabs, which
 * buffer every edit and save through the settings page's unsaved-changes bar
 * (spec 097 Session 2026-10-22).
 */

type ProfileReference = { id: string; name: string; uri: string; description: string };

export type ProfileReferenceChanges<R extends ProfileReference> = { created: R[]; edited: R[]; removed: R[] };

const TEMP_PREFIX = 'temp-';

export const newReferenceId = (index: number) => `${TEMP_PREFIX}${Date.now()}-${index}`;

const isNew = (ref: ProfileReference) => ref.id === '' || ref.id.startsWith(TEMP_PREFIX);

/**
 * What saving a profile's references would do: create the new rows (those with
 * no URL yet are ignored), patch the edited ones and delete the removed ones.
 * Recognized social links take part as ordinary rows — an empty placeholder is
 * ignored until a URL is typed into it.
 */
export const diffProfileReferences = <R extends ProfileReference>(
  current: ReadonlyArray<R | null>,
  saved: ReadonlyArray<R | null>
): ProfileReferenceChanges<R> => {
  const currentRows = current.filter((r): r is R => r !== null);
  const savedRows = saved.filter((r): r is R => r !== null && !isNew(r));
  const savedById = new Map(savedRows.map(r => [r.id, r] as const));
  const currentIds = new Set(currentRows.map(r => r.id));
  return {
    created: currentRows.filter(r => isNew(r) && r.uri.trim() !== ''),
    edited: currentRows.filter(r => {
      const before = savedById.get(r.id);
      return (
        before !== undefined && (before.name !== r.name || before.uri !== r.uri || before.description !== r.description)
      );
    }),
    removed: savedRows.filter(r => !currentIds.has(r.id)),
  };
};

export const countReferenceChanges = ({ created, edited, removed }: ProfileReferenceChanges<ProfileReference>) =>
  created.length + edited.length + removed.length;

type SaveProfileChangesParams<R extends ProfileReference, T extends string> = {
  /** The one update mutation for the profile's own fields, or null when none changed. */
  updateCore: (() => Promise<unknown>) | null;
  /** Tagsets the profile does not have yet, keyed by form field. */
  tagsetsToCreate: ReadonlyArray<{ field: T; create: () => Promise<unknown> }>;
  references: ProfileReferenceChanges<R>;
  createReference: (ref: R) => Promise<unknown>;
  deleteReference: (ref: R) => Promise<unknown>;
};

/**
 * Runs a Profile tab's Save: the core update, then each new tagset, new
 * reference and removed reference as its own mutation. Every step runs even
 * after a failure; the result says which ones failed so the caller keeps them
 * buffered (and counted) for the next Save.
 */
export const saveProfileChanges = async <R extends ProfileReference, T extends string>({
  updateCore,
  tagsetsToCreate,
  references,
  createReference,
  deleteReference,
}: SaveProfileChangesParams<R, T>) => {
  let firstError: string | null = null;
  const attempt = async (run: () => Promise<unknown>) => {
    try {
      await run();
      return true;
    } catch (err) {
      firstError ??= err instanceof Error ? err.message : String(err);
      return false;
    }
  };

  const coreFailed = updateCore ? !(await attempt(updateCore)) : false;
  const failedTagsets: T[] = [];
  for (const { field, create } of tagsetsToCreate) {
    if (!(await attempt(create))) failedTagsets.push(field);
  }
  const failedCreates: R[] = [];
  for (const ref of references.created) {
    if (!(await attempt(() => createReference(ref)))) failedCreates.push(ref);
  }
  const failedRemovals = new Set<string>();
  for (const ref of references.removed) {
    if (!(await attempt(() => deleteReference(ref)))) failedRemovals.add(ref.id);
  }
  return { firstError: firstError as string | null, coreFailed, failedTagsets, failedCreates, failedRemovals };
};

/**
 * The reference list to keep after a Save: the server's rows, minus removals
 * that failed (they stay removed in the buffer), with the buffered edits kept
 * when the core update failed, plus the creates that failed.
 */
export const rebaseReferences = <R extends ProfileReference>(
  fresh: ReadonlyArray<R>,
  references: ProfileReferenceChanges<R>,
  result: { coreFailed: boolean; failedCreates: ReadonlyArray<R>; failedRemovals: ReadonlySet<string> }
): R[] => {
  const editedById = new Map(references.edited.map(r => [r.id, r] as const));
  return [
    ...fresh
      .filter(r => !result.failedRemovals.has(r.id))
      .map(r => (result.coreFailed ? (editedById.get(r.id) ?? r) : r)),
    ...result.failedCreates,
  ];
};
