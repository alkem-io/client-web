import type { ReactNode } from 'react';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

type SpaceShellProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  /**
   * Visually collapses the sidebar column while keeping the `sidebar` node mounted:
   * the column is hidden at every breakpoint and the content takes the full
   * no-sidebar width. Use when the sidebar is known to render nothing (e.g. a tab
   * configured with zero widgets) — the slot must stay in the DOM for portals that
   * resolve their target element once on mount.
   */
  sidebarCollapsed?: boolean;
  tabs?: ReactNode;
  children: ReactNode;
  /**
   * When true, the body fills all 12 grid columns instead of the default
   * `lg:col-start-2 lg:col-span-10` inset (one empty gutter column per side).
   * The outer `px-6 md:px-8` edge padding is unaffected.
   */
  fullWidth?: boolean;
  className?: string;
};

export function SpaceShell({
  header,
  sidebar,
  sidebarCollapsed,
  tabs,
  children,
  fullWidth,
  className,
}: SpaceShellProps) {
  const hasSidebar = !!sidebar;
  // Collapsed: the node stays mounted (hidden) but the layout behaves as if there
  // were no sidebar — the content column spans the full no-sidebar width.
  const showSidebar = hasSidebar && !sidebarCollapsed;
  const hasTabs = !!tabs;

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      {header}

      <div className={cn('w-full px-6 md:px-8 pb-8')}>
        {/* Row gap is sm+ only: below sm the tabs row is zero-height (the tabs render
            as a fixed bottom bar), so a mobile row gap would just be a dead band
            between the header and the content. */}
        <div className="grid grid-cols-12 gap-x-6 sm:gap-y-6 items-start">
          {/* Sticky tab bar — full-width row spanning sidebar + content, pinned below the
              h-16 platform header. Decorations are sm+ only: below sm the tabs render as a
              fixed bottom bar, so the wrapper must not reserve sticky space. z-30 keeps the
              translucent row above in-content z-10 decorations (carousel arrows etc.) while
              staying under the z-40 fixed mobile bars. */}
          {hasTabs && (
            <div
              className={cn(
                'col-span-12',
                !fullWidth && 'lg:col-start-2 lg:col-span-10',
                'sm:sticky sm:top-16 sm:z-30 sm:pt-4 sm:bg-background/95 sm:backdrop-blur-[8px]'
              )}
            >
              {tabs}
            </div>
          )}

          {hasSidebar && (
            <div
              className={cn(
                'hidden',
                showSidebar && [
                  'lg:block col-span-2 sticky top-[8.5rem] self-start max-h-[calc(100vh-8.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  fullWidth ? 'lg:col-start-1' : 'lg:col-start-2',
                ]
              )}
            >
              {sidebar}
            </div>
          )}

          <div
            className={cn(
              'col-span-12 min-w-0',
              showSidebar ? (fullWidth ? 'lg:col-span-10' : 'lg:col-span-8') : contentColumnClass(fullWidth)
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
