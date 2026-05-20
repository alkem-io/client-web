import { type ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders a tab page's primary action (e.g. "Add Post" / "Create Subspace")
 * into the right-aligned slot of the desktop space tab bar. The target `<div>`
 * is mounted by the layout (`CrdSpacePageLayout`) as the `action` slot of
 * `SpaceNavigationTabs`, so each tab page can call this once and the button
 * appears on the same row as the tabs.
 *
 * The target only exists on desktop — on the mobile bottom tab bar there is no
 * such slot, so the portal renders nothing and consumers fall back to an
 * in-content action (see `SpaceTabActionHeader`).
 *
 * Target is resolved in `useLayoutEffect` rather than during render: the parent
 * layout commits its tab slot in the same pass this component renders in, so a
 * render-time `getElementById` can return `null` for the very first render.
 */
export function SpaceTabsActionPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    setTarget(document.getElementById('crd-space-tabs-action'));
  }, []);

  return target ? createPortal(children, target) : null;
}
