import type { ReactNode } from 'react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

type TabStateHeaderProps = {
  /** Markdown description for the active tab / flow state. Wraps on the left. */
  description?: string;
  /** Optional action element (e.g. an "Add Post" / "Invite Member" / "Create Subspace" Button). Pinned to the right. */
  action?: ReactNode;
  className?: string;
};

export function TabStateHeader({ description, action, className }: TabStateHeaderProps) {
  if (!description && !action) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6', className)}>
      {description ? (
        <div className="flex-1 min-w-0">
          <MarkdownContent
            content={description}
            className="text-body text-muted-foreground [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p:last-child]:mb-0"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}
