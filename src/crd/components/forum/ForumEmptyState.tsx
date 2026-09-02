import { MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

type ForumEmptyStateProps = {
  title: string;
  subtitle: string;
  iconNode?: ReactNode;
  className?: string;
};

export function ForumEmptyState({ title, subtitle, iconNode, className }: ForumEmptyStateProps) {
  return (
    <output aria-live="polite" className={cn('block px-6 py-12 text-center', className)}>
      <div
        aria-hidden="true"
        className="mx-auto mb-3 flex size-10 items-center justify-center text-muted-foreground/40"
      >
        {iconNode ?? <MessageSquare className="size-10" />}
      </div>
      <p className="text-body text-muted-foreground">{title}</p>
      <p className="mt-1 text-caption text-muted-foreground">{subtitle}</p>
    </output>
  );
}
