import type { ReactNode } from 'react';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

type NoticeBandProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

/**
 * Full-width amber notice band attached under the nav bar. The band spans the
 * viewport while its contents sit in the same inset grid band as `Header`, so
 * the text lines up with the Alkemio logo and a trailing dismiss button with
 * the user avatar.
 */
export function NoticeBand({ children, className, 'aria-label': ariaLabel }: NoticeBandProps) {
  return (
    <output
      className={cn('block border-b border-amber-200 bg-amber-50 text-amber-800 text-body', className)}
      aria-label={ariaLabel}
    >
      {/* Padding / grid / column span kept in sync with `Header`'s inner band. */}
      <div className="w-full px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex items-center gap-2 py-3 lg:px-3', contentColumnClass())}>{children}</div>
        </div>
      </div>
    </output>
  );
}
