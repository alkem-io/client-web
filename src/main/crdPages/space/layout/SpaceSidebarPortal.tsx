import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders the sidebar content into both the desktop sidebar column and the
 * mobile-drawer slot. The two target `<div>`s are mounted by the layout
 * (`CrdSpacePageLayout`) and stay in the DOM regardless of viewport, so each
 * tab page can call this once and the right one is picked up at every size.
 */
export function SpaceSidebarPortal({ children }: { children: ReactNode }) {
  const desktop = typeof document === 'undefined' ? null : document.getElementById('crd-space-sidebar-desktop');
  const mobile = typeof document === 'undefined' ? null : document.getElementById('crd-space-sidebar-mobile');

  return (
    <>
      {desktop && createPortal(children, desktop)}
      {mobile && createPortal(children, mobile)}
    </>
  );
}
