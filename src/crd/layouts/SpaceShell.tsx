import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type SpaceShellProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  tabs?: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SpaceShell({ header, sidebar, tabs, breadcrumbs, children, className }: SpaceShellProps) {
  const hasSidebar = !!sidebar;
  const hasTabs = !!tabs;

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      {breadcrumbs && <div className="w-full px-6 md:px-8 py-2 text-caption text-muted-foreground">{breadcrumbs}</div>}
      {header}

      <div className={cn('w-full px-6 md:px-8 pb-8', hasTabs ? 'pt-8' : 'pt-0')}>
        <div className="grid grid-cols-12 gap-6 items-start">
          {hasSidebar && <div className="hidden lg:block lg:col-start-2 col-span-2">{sidebar}</div>}

          <div className={cn('col-span-12 min-w-0', hasSidebar ? 'lg:col-span-8' : 'lg:col-start-2 lg:col-span-10')}>
            {hasTabs && <div className="mb-6">{tabs}</div>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
