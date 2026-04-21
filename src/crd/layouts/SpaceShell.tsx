import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type SpaceShellProps = {
  header: ReactNode;
  sidebar: ReactNode;
  tabs: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SpaceShell({ header, sidebar, tabs, breadcrumbs, children, className }: SpaceShellProps) {
  return (
    <div className={cn('flex flex-col bg-background', className)}>
      {header}

      <div className="w-full px-6 md:px-8 py-8">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Sidebar — hidden on mobile, starts at col 2 on lg */}
          <div className="hidden lg:block lg:col-start-2 col-span-2">{sidebar}</div>

          {/* Content area — full width on mobile, 8 cols on lg */}
          <div className="col-span-12 lg:col-span-8 min-w-0">
            <div className="mb-6">{tabs}</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
