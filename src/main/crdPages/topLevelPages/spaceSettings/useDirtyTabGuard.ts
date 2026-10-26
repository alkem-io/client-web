import { useEffect, useRef, useState } from 'react';
import type { SpaceSettingsTabId } from './useSpaceSettingsTab';

/**
 * useDirtyTabGuard — centralizes the Settings dirty-buffer protection.
 *
 * A tab is dirty while its unsaved-changes bar counts any change (About,
 * Layout, Settings), or while an Updates draft or an Application Form edit is
 * pending. The guard covers:
 *
 *   1. Tab switches within Settings via `requestSwitch(next)`, which suspends
 *      until the consumer resolves it (typically after a confirm dialog). While
 *      a save is running (`setSaving(true)`) a switch is refused outright: the
 *      dialog's Save or Discard would otherwise race the writes in flight.
 *   2. Browser close / refresh via a `beforeunload` listener while dirty.
 *
 * **Limitation (Checkpoint A):** the app uses the legacy `<BrowserRouter>`
 * which does not support `useBlocker`, so we cannot intercept in-app
 * `<Link>`-based navigation away from the Settings page. A follow-up will
 * add capture-level link interception inside the settings shell. For now,
 * admins who click a nav link outside Settings while dirty will lose their
 * edits silently — same behavior as the MUI settings page has today.
 */

export type DirtyTabGuard = {
  isDirty: boolean;
  markDirty: () => void;
  clearDirty: () => void;
  /** Marks a save as running; tab switches are refused until it ends. */
  setSaving: (saving: boolean) => void;
  /**
   * When dirty: returns a promise that resolves once the consumer has decided
   * whether to proceed (`resolvePendingSwitch(true)`) or not
   * (`resolvePendingSwitch(false)`). When clean: resolves immediately to
   * `true` and the switch proceeds without a dialog.
   */
  requestSwitch: (next: SpaceSettingsTabId) => Promise<boolean>;
  /** The pending switch target, if the consumer is mid-confirmation. */
  pendingSwitch: SpaceSettingsTabId | null;
  /** Resolve the pending switch; `true` allows it, `false` cancels it. */
  resolvePendingSwitch: (allow: boolean) => void;
};

export function useDirtyTabGuard(): DirtyTabGuard {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<SpaceSettingsTabId | null>(null);
  const pendingSwitchResolver = useRef<((allow: boolean) => void) | null>(null);

  const markDirty = () => setIsDirty(true);
  const clearDirty = () => setIsDirty(false);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const requestSwitch = (next: SpaceSettingsTabId) =>
    new Promise<boolean>(resolve => {
      if (isSaving) {
        resolve(false);
        return;
      }
      if (!isDirty) {
        resolve(true);
        return;
      }
      // A confirmation is already pending (e.g. a second tab click before the
      // user answered the dialog). Ignore the new request rather than
      // overwriting the stored resolver, which would orphan the first promise
      // and leave the guard inconsistent.
      if (pendingSwitchResolver.current) {
        resolve(false);
        return;
      }
      setPendingSwitch(next);
      pendingSwitchResolver.current = resolve;
    });

  const resolvePendingSwitch = (allow: boolean) => {
    const resolver = pendingSwitchResolver.current;
    pendingSwitchResolver.current = null;
    setPendingSwitch(null);
    resolver?.(allow);
  };

  return {
    isDirty,
    markDirty,
    clearDirty,
    setSaving: setIsSaving,
    requestSwitch,
    pendingSwitch,
    resolvePendingSwitch,
  };
}
