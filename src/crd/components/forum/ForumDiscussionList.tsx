import type { ReactNode } from 'react';
import { ForumDiscussionListItem } from '@/crd/components/forum/ForumDiscussionListItem';
import type { ForumDiscussionListItemData } from '@/crd/components/forum/forumTypes';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

type ForumDiscussionListProps = {
  items: ForumDiscussionListItemData[];
  metaLineFor: (item: ForumDiscussionListItemData) => string;
  emptySlot: ReactNode;
  loading?: boolean;
  loadingSlot?: ReactNode;
  loadingLabel?: string;
  onActivate?: (id: string) => void;
  className?: string;
};

const SKELETON_ROW_KEYS = ['row-0', 'row-1', 'row-2', 'row-3', 'row-4'] as const;

const DefaultLoadingSlot = ({ label }: { label?: string }) => (
  <output aria-label={label} className="flex flex-col">
    {SKELETON_ROW_KEYS.map((key, index) => (
      <div key={key} className={cn('flex items-start gap-3 px-5 py-3.5', index < 4 && 'border-b border-border')}>
        <Skeleton className="size-5 shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </output>
);

export function ForumDiscussionList({
  items,
  metaLineFor,
  emptySlot,
  loading,
  loadingSlot,
  loadingLabel,
  onActivate,
  className,
}: ForumDiscussionListProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}>
      {loading ? (
        (loadingSlot ?? <DefaultLoadingSlot label={loadingLabel} />)
      ) : items.length === 0 ? (
        emptySlot
      ) : (
        <ul className="flex flex-col">
          {items.map((item, index) => (
            <ForumDiscussionListItem
              key={item.id}
              data={item}
              metaLine={metaLineFor(item)}
              isLast={index === items.length - 1}
              onActivate={onActivate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
