import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { cn } from '@/crd/lib/utils';

export type MobileSidebarDrawerProps = {
  /** Controls drawer visibility. Closed = panel slid off-screen, backdrop hidden. */
  open: boolean;
  /** Fired by the backdrop, the close button, and the Escape key. */
  onClose: () => void;
  /** Heading shown at the top of the panel; also used as the dialog's accessible name. */
  title: string;
  /** Accessible label for the X button and the backdrop button. */
  closeLabel: string;
  /** Drawer body. The drawer is always mounted in the DOM, so children — including
   *  React-portal targets — remain reliably available regardless of `open`. */
  children: ReactNode;
  className?: string;
};

/**
 * Always-mounted slide-in sidebar drawer.
 *
 * Visibility is driven entirely by CSS transforms (`-translate-x-full` when
 * closed) and opacity transitions, not by mount/unmount. This is what makes
 * the component safe to use as a host for React portals: children stay in the
 * DOM whether the drawer is open or not.
 *
 * Trade-off vs. the Radix-based {@link Sheet} primitive: this drawer does not
 * provide a focus trap or body-scroll lock. Use it when you need a stable
 * portal host (e.g. mobile sidebar populated by deeper-tree components); use
 * `Sheet` when content lives inside the drawer JSX directly.
 */
export function MobileSidebarDrawer({
  open,
  onClose,
  title,
  closeLabel,
  children,
  className,
}: MobileSidebarDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={cn('lg:hidden', className)}>
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-label={closeLabel}
        tabIndex={open ? 0 : -1}
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label={title}
        aria-hidden={!open}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-3/4 max-w-sm bg-background border-r border-border shadow-lg overflow-y-auto transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-subsection-title font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={closeLabel}
            tabIndex={open ? 0 : -1}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </aside>
    </div>
  );
}
