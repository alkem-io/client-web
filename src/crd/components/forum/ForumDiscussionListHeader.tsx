import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ForumSortOrder } from '@/crd/components/forum/forumTypes';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

type ForumDiscussionListHeaderProps = {
  countLabel: string;
  initiateSlot?: ReactNode;
  searchValue: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  onSearchChange: (next: string) => void;
  sortValue: ForumSortOrder;
  sortAriaLabel: string;
  sortOptions: { value: ForumSortOrder; label: string }[];
  onSortChange: (next: ForumSortOrder) => void;
  className?: string;
};

export function ForumDiscussionListHeader({
  countLabel,
  initiateSlot,
  searchValue,
  searchPlaceholder,
  searchAriaLabel,
  onSearchChange,
  sortValue,
  sortAriaLabel,
  sortOptions,
  onSortChange,
  className,
}: ForumDiscussionListHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Row 1 — title + initiate (prototype: count left, button right). */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-card-title text-foreground">{countLabel}</h2>
        {initiateSlot ? <div className="flex items-center gap-2">{initiateSlot}</div> : null}
      </div>
      {/* Row 2 — search + sort (prototype: search grows, sort fixed-width). */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={searchAriaLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={event => onSearchChange(event.target.value)}
            className="pl-9 text-control"
          />
        </div>
        <Select value={sortValue} onValueChange={value => onSortChange(value as ForumSortOrder)}>
          <SelectTrigger aria-label={sortAriaLabel} className="h-9 w-28 text-control">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
