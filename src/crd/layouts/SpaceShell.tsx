import type { ReactNode } from 'react';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

type SpaceShellProps = {
  header: ReactNode;
  sidebar?: ReactNode;
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

export function SpaceShell({ header, sidebar, tabs, children, fullWidth, className }: SpaceShellProps) {
  const hasSidebar = !!sidebar;
  const hasTabs = !!tabs;

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      {header}

      <div className={cn('w-full px-6 md:px-8 pb-8')}>
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Sticky tab bar — full-width row spanning sidebar + content, pinned below the
              h-16 platform header. Decorations are sm+ only: below sm the tabs render as a
              fixed bottom bar, so the wrapper must not reserve sticky space. */}
          {hasTabs && (
            <div
              className={cn(
                'col-span-12',
                !fullWidth && 'lg:col-start-2 lg:col-span-10',
                'sm:sticky sm:top-16 sm:z-10 sm:pt-4 sm:bg-background/95 sm:backdrop-blur-[8px]'
              )}
            >
              {tabs}
            </div>
          )}

          {hasSidebar && (
            <div
              className={cn(
                'hidden lg:block col-span-2 sticky top-[8.5rem] self-start max-h-[calc(100vh-8.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                fullWidth ? 'lg:col-start-1' : 'lg:col-start-2'
              )}
            >
              {sidebar}
            </div>
          )}

          <div
            className={cn(
              'col-span-12 min-w-0',
              hasSidebar ? (fullWidth ? 'lg:col-span-10' : 'lg:col-span-8') : contentColumnClass(fullWidth)
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
