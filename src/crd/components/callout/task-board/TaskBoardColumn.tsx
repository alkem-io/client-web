import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type TaskBoardColumnProps = {
  name: string;
  /**
   * Number shown in the header badge. Always fed from the server-authoritative
   * task column counts — never derived from the rendered card list.
   */
  count: number;
  /** Rendered card list (or skeletons/empty state) for this column. */
  children?: ReactNode;
  /** Label for the per-column add affordance; the button only shows when set with onAdd. */
  addLabel?: string;
  onAdd?: () => void;
  emptyLabel?: string;
  className?: string;
};

/**
 * One board column: a header with the column name and its count badge, a
 * vertically scrolling body of cards, and an optional add affordance. The count
 * is a prop — this component never counts its own children.
 */
export function TaskBoardColumn({
  name,
  count,
  children,
  addLabel,
  onAdd,
  emptyLabel,
  className,
}: TaskBoardColumnProps) {
  const isEmpty = children == null || (Array.isArray(children) && children.length === 0);

  return (
    <div className={cn('flex flex-col w-72 shrink-0 rounded-lg bg-muted/40 max-h-full', className)}>
      <div className="flex items-center gap-2 px-3 py-2 shrink-0">
        <span className="text-card-title text-foreground truncate">{name}</span>
        <Badge variant="secondary" className="shrink-0">
          {count}
        </Badge>
        {onAdd && (
          <Button variant="ghost" size="icon" className="ml-auto size-6 shrink-0" onClick={onAdd} aria-label={addLabel}>
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto px-3 pb-3">
        {isEmpty && emptyLabel ? (
          <p className="text-caption text-muted-foreground py-4 text-center">{emptyLabel}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
