import { useEffect, useRef, useState } from 'react';
import type { SpaceSettingsTabId } from './useSpaceSettingsTab';

/**
 * useDirtyTabGuard — centralizes Layout's dirty-buffer protection.
 *
 * Only the Layout tab can enter a dirty state (About uses per-field autosave
 * with `flushPending()` instead — see Decision 3a). The guard covers:
 *
 *   1. Tab switches within Settings via `requestSwitch(next)`, which suspends
 *      until the consumer resolves it (typically after a confirm dialog).
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
      if (!isDirty) {
        resolve(true);
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
    requestSwitch,
    pendingSwitch,
    resolvePendingSwitch,
  };
}
