import { createContext, useContext } from 'react';
import type { DirtyTabGuard } from './useDirtyTabGuard';

/**
 * Bridges the dirty-tab guard across the router `<Outlet>` boundary.
 *
 * The Settings tab strip is rendered by the *parent* layout
 * (`CrdSpacePageLayout` / `CrdSubspacePageLayout`), while the dirty state and
 * the discard-changes dialog live in the *child* page (`CrdSpaceSettingsPage`).
 * Without a shared guard instance the layout's tab click would navigate
 * directly and bypass `requestSwitch`, so the dialog would never open.
 *
 * The layout creates the guard via `useDirtyTabGuard()`, provides it here, and
 * wraps the tab-strip `onTabChange` in `requestSwitch`. The page consumes the
 * same instance via `useDirtyTabGuardContext()`.
 */
export const DirtyTabGuardContext = createContext<DirtyTabGuard | null>(null);

export function useDirtyTabGuardContext(): DirtyTabGuard {
  const guard = useContext(DirtyTabGuardContext);
  if (!guard) {
    throw new Error('useDirtyTabGuardContext must be used within a DirtyTabGuardContext.Provider');
  }
  return guard;
}
