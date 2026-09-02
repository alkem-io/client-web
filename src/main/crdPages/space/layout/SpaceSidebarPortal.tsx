import { type ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders the sidebar content into both the desktop sidebar column and the
 * mobile-drawer slot. The two target `<div>`s are mounted by the layout
 * (`CrdSpacePageLayout`) and stay in the DOM regardless of viewport, so each
 * tab page can call this once and the right one is picked up at every size.
 *
 * Targets are resolved in `useLayoutEffect` rather than during render: the
 * parent layout commits its sidebar slots in the same pass this component
 * renders in, so a render-time `getElementById` can return `null` for the very
 * first render and leave the sidebar empty until something else triggers a
 * rerender.
 */
export function SpaceSidebarPortal({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<{ desktop: Element | null; mobile: Element | null }>({
    desktop: null,
    mobile: null,
  });

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    setTargets({
      desktop: document.getElementById('crd-space-sidebar-desktop'),
      mobile: document.getElementById('crd-space-sidebar-mobile'),
    });
  }, []);

  return (
    <>
      {targets.desktop && createPortal(children, targets.desktop)}
      {targets.mobile && createPortal(children, targets.mobile)}
    </>
  );
}
