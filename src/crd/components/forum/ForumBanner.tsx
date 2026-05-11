import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type ForumBannerProps = {
  titleNode: ReactNode;
  subtitleNode: ReactNode;
  iconNode: ReactNode;
  className?: string;
};

export function ForumBanner({ titleNode, subtitleNode, iconNode, className }: ForumBannerProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/70 px-8 py-8 text-white',
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
          <defs>
            <pattern id="forum-banner-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#forum-banner-dots)" />
        </svg>
      </div>
      <div className="relative z-10">
        <div className="mb-1 flex items-center gap-3">
          <div aria-hidden="true" className="flex size-9 items-center justify-center rounded-md bg-white/15">
            {iconNode}
          </div>
          <h1 className="text-section-title md:text-page-title text-white">{titleNode}</h1>
        </div>
        <p className="ml-12 mt-1 max-w-md text-body text-white/75">{subtitleNode}</p>
      </div>
    </header>
  );
}
