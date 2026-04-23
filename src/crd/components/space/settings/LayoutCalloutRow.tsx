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
};

export function LayoutCalloutRow({
  callout,
  currentColumnId: _currentColumnId,
  otherColumns,
  showDescription,
  onMoveToColumn,
  onViewPost,
  className,
}: LayoutCalloutRowProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: callout.id,
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
        'group/row flex items-start gap-2 rounded-md border bg-card px-2 py-2 transition-colors hover:bg-accent/40',
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
        aria-label={t('layout.row.drag', { defaultValue: 'Drag to reorder' })}
        className="mt-1 cursor-grab touch-none rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-body-emphasis">{callout.title}</div>
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
            aria-label={t('layout.row.menu', { defaultValue: 'Callout actions' })}
            className="shrink-0"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t('layout.row.moveTo', { defaultValue: 'Move to' })}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherColumns.map(col => (
                <DropdownMenuItem key={col.id} onClick={() => onMoveToColumn(callout.id, col.id)}>
                  {col.title}
                </DropdownMenuItem>
              ))}
              {otherColumns.length === 0 && (
                <DropdownMenuItem disabled={true}>
                  {t('layout.row.noOtherColumns', { defaultValue: 'No other columns' })}
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => onViewPost(callout.id)}>
            {t('layout.row.viewPost', { defaultValue: 'View Post' })}
          </DropdownMenuItem>
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
    <div className="flex cursor-grabbing items-start gap-2 rounded-md border bg-card px-2 py-2 shadow-lg ring-1 ring-ring/40">
      <span className="mt-1 p-0.5 text-muted-foreground">
        <GripVertical aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-body-emphasis">{callout.title}</div>
        {showDescription && callout.description ? (
          <p className="mt-0.5 line-clamp-3 text-caption text-muted-foreground">{callout.description}</p>
        ) : null}
      </div>
      <span aria-hidden="true" className="size-9 shrink-0" />
    </div>
  );
}
