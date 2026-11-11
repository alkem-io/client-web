import type { ReactNode } from 'react';
import { ExpandableMarkdown } from '@/crd/components/common/ExpandableMarkdown';
import { cn } from '@/crd/lib/utils';

type TabStateHeaderProps = {
  /** Markdown description for the active tab / flow state. Wraps on the left. */
  description?: string;
  /** Optional action element (e.g. an "Add Post" / "Invite Member" / "Create Subspace" Button). Pinned to the right. */
  action?: ReactNode;
  className?: string;
};

const hasVisibleMarkdownContent = (value?: string) => {
  if (!value) return false;

  return value.replace(/<br\s*\/?>/gi, '').trim().length > 0;
};

export function TabStateHeader({ description, action, className }: TabStateHeaderProps) {
  const hasDescription = hasVisibleMarkdownContent(description);

  if (!hasDescription && !action) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6', className)}>
      {hasDescription ? (
        <div className="flex-1 min-w-0">
          <ExpandableMarkdown content={description ?? ''} />
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}
