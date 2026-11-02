import type { UnsavedChangesBarState } from '@/crd/components/common/UnsavedChangesBar';

/**
 * What every settings tab with buffered fields exposes to the page, so the
 * unsaved-changes bar, its Discard confirmation and the tab-switch dialog drive
 * all of them the same way (spec 045 FR-025 – FR-026).
 */
export type TabUnsavedChanges = {
  /** One per changed field (FR-025b); 0 = nothing to save. */
  count: number;
  /** False while any buffered edit is invalid. */
  canSave: boolean;
  /** Why Save is disabled, shown on the disabled button — for an invalid edit the user may not be looking at. */
  saveBlockedReason?: string;
  saving: boolean;
  /** Message of the last failed Save; the failed parts stay counted. */
  error: string | null;
  /** Saves every change on the tab. Resolves `true` when everything saved. */
  saveAll: () => Promise<boolean>;
  /** Puts every changed field back to its server value, in place. */
  reset: () => void;
};

export const NO_UNSAVED_CHANGES: TabUnsavedChanges = {
  count: 0,
  canSave: false,
  saving: false,
  error: null,
  saveAll: async () => true,
  reset: () => {},
};

export function toUnsavedChangesBarState(unsaved: TabUnsavedChanges): UnsavedChangesBarState {
  if (unsaved.saving) return { kind: 'saving', count: unsaved.count };
  if (unsaved.count === 0) return { kind: 'clean' };
  if (unsaved.error)
    return {
      kind: 'saveError',
      count: unsaved.count,
      message: unsaved.error,
      canSave: unsaved.canSave,
      saveBlockedReason: unsaved.saveBlockedReason,
    };
  return {
    kind: 'dirty',
    count: unsaved.count,
    canSave: unsaved.canSave,
    saveBlockedReason: unsaved.saveBlockedReason,
  };
}

export const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));
