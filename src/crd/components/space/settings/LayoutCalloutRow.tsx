import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import type { LayoutCallout, LayoutColumnId, LayoutPoolColumn } from './SpaceSettingsLayoutView.types';

type LayoutCalloutRowProps = {
  callout: LayoutCallout;
  currentColumnId: LayoutColumnId;
  otherColumns: ReadonlyArray<Pick<LayoutPoolColumn, 'id' | 'title'>>;
  showDescription: boolean;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  className?: string;
  /** Freezes the row while the layout is being saved: no drag, no Move to. */
  locked?: boolean;
};

export function LayoutCalloutRow({
  callout,
  currentColumnId: _currentColumnId,
  otherColumns,
  showDescription,
  onMoveToColumn,
  onViewPost,
  locked = false,
  className,
}: LayoutCalloutRowProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: callout.id,
    disabled: locked,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/row flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2 transition-colors hover:border-primary/30',
        // While dragging, collapse the original row into a thin placeholder — the
        // DragOverlay carries the real visual, and this leaves a clear gap that
        // shifts alongside sibling reorder so the drop target is obvious.
        isDragging && 'pointer-events-none opacity-30',
        className
      )}
      data-callout-id={callout.id}
    >
      <button
        type="button"
        aria-label={t('layout.row.drag')}
        disabled={locked}
        className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground/30 outline-none group-hover/row:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-caption font-medium text-foreground">{callout.title}</div>
        {showDescription && callout.description ? (
          <p className="mt-0.5 line-clamp-3 text-caption text-muted-foreground">{callout.description}</p>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('layout.row.menu')}
            className="size-6 shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreVertical aria-hidden="true" className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={locked}>{t('layout.row.moveTo')}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherColumns.map(col => (
                <DropdownMenuItem key={col.id} onClick={() => onMoveToColumn(callout.id, col.id)}>
                  {col.title}
                </DropdownMenuItem>
              ))}
              {otherColumns.length === 0 && (
                <DropdownMenuItem disabled={true}>{t('layout.row.noOtherColumns')}</DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {callout.profileUrl ? (
            <DropdownMenuItem onClick={() => onViewPost(callout.id)}>{t('layout.row.viewPost')}</DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type LayoutCalloutRowPreviewProps = {
  callout: LayoutCallout;
  showDescription: boolean;
};

/**
 * Non-interactive visual clone of a callout row, rendered inside the DndContext
 * DragOverlay so the item visibly follows the cursor during drag.
 */
export function LayoutCalloutRowPreview({ callout, showDescription }: LayoutCalloutRowPreviewProps) {
  return (
    <div className="flex rotate-2 cursor-grabbing items-center gap-2 rounded-lg border bg-background px-2.5 py-2 shadow-lg">
      <span className="p-0.5 text-muted-foreground/60">
        <GripVertical aria-hidden="true" className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-caption font-medium text-foreground">{callout.title}</div>
        {showDescription && callout.description ? (
          <p className="mt-0.5 line-clamp-3 text-caption text-muted-foreground">{callout.description}</p>
        ) : null}
      </div>
      <span aria-hidden="true" className="size-6 shrink-0" />
    </div>
  );
}
