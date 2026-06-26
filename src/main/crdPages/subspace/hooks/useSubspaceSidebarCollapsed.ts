import { useState } from 'react';

/**
 * Persisted collapse state for the subspace sidebar.
 *
 * Reuses the legacy MUI key (`menuState` / `'collapsed'|'expanded'`) verbatim
 * so the preference is shared across both design versions — collapsing in one
 * is reflected in the other. The constant is duplicated here (rather than
 * imported from the MUI `SubspaceInfoColumn`) on purpose: that module pulls in
 * the MUI icons package, and the CRD route bundle must stay MUI-free.
 */
const STORAGE_KEY = 'menuState';
const COLLAPSED = 'collapsed';
const EXPANDED = 'expanded';

export function useSubspaceSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === COLLAPSED
  );

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? COLLAPSED : EXPANDED);
      }
      return next;
    });
  };

  return { collapsed, toggle };
}
