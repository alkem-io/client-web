import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type ForumLayoutProps = {
  ribbonNode?: ReactNode;
  bannerNode: ReactNode;
  sidebarNode: ReactNode;
  mainNode: ReactNode;
  className?: string;
};

export function ForumLayout({ ribbonNode, bannerNode, sidebarNode, mainNode, className }: ForumLayoutProps) {
  return (
    <div className={cn('flex w-full flex-col px-6 pb-12 md:px-8', className)}>
      {ribbonNode ? <div className="w-full">{ribbonNode}</div> : null}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-10 lg:col-start-2">
          <div className="pb-6 pt-8">{bannerNode}</div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="hidden md:col-span-3 md:block lg:col-span-2 lg:col-start-2">{sidebarNode}</div>
        <div className="col-span-12 md:col-span-9 lg:col-span-8">{mainNode}</div>
      </div>
    </div>
  );
}
