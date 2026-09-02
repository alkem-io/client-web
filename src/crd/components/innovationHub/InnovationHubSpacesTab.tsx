import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type SpaceVisibilityVariant = 'active' | 'demo' | 'inactive' | 'archived' | 'unknown';

export type HubSpacesTableRow = {
  id: string;
  name: string;
  visibility: SpaceVisibilityVariant;
  visibilityLabel: string;
  hostAccount: string;
  spaceUrl: string;
};

export type InnovationHubSpacesTabProps = {
  rows: HubSpacesTableRow[];
  busy: boolean;
  onReorder: (orderedIds: string[]) => void;
  onAddClick: () => void;
  onRemoveRequest: (row: HubSpacesTableRow) => void;
};

const visibilityVariantClass: Record<SpaceVisibilityVariant, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  demo: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  inactive: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
  unknown: 'bg-muted text-muted-foreground',
};

const SortableRow = ({
  row,
  onRemoveRequest,
  busy,
  removeAriaLabel,
  dragHandleAriaLabel,
}: {
  row: HubSpacesTableRow;
  onRemoveRequest: (row: HubSpacesTableRow) => void;
  busy: boolean;
  removeAriaLabel: string;
  dragHandleAriaLabel: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'bg-accent')}>
      <TableCell className="w-12">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={dragHandleAriaLabel}
          className={cn(
            'inline-flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'touch-none'
          )}
          disabled={busy}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('text-caption uppercase', visibilityVariantClass[row.visibility])}>
          {row.visibilityLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{row.hostAccount}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveRequest(row)}
          disabled={busy}
          aria-label={removeAriaLabel}
        >
          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const InnovationHubSpacesTab = ({
  rows,
  busy,
  onReorder,
  onAddClick,
  onRemoveRequest,
}: InnovationHubSpacesTabProps) => {
  const { t } = useTranslation('crd-innovationHub');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const ids = rows.map(r => r.id);
    const activeId = String(active.id);
    const overId = String(over.id);
    const next = ids.filter(id => id !== activeId);
    const overIndex = ids.indexOf(overId);
    next.splice(overIndex, 0, activeId);
    onReorder(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-page-title">{t('settings.spaces.title')}</h2>
          <p className="text-body mt-2 text-muted-foreground">{t('settings.spaces.subtitle')}</p>
        </div>
        <Button onClick={onAddClick} disabled={busy} className="gap-2">
          <Plus aria-hidden="true" className="size-4" />
          {t('settings.spaces.actions.add')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-body text-muted-foreground">{t('settings.spaces.empty')}</p>
          <Button onClick={onAddClick} variant="outline" className="mt-4 gap-2">
            <Plus aria-hidden="true" className="size-4" />
            {t('settings.spaces.actions.add')}
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="rounded-lg border border-border">
              <Table>
                <TableCaption className="sr-only">{t('settings.spaces.title')}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead aria-label={t('settings.spaces.dragHandle')} className="w-12" />
                    <TableHead>{t('settings.spaces.columns.name')}</TableHead>
                    <TableHead>{t('settings.spaces.columns.visibility')}</TableHead>
                    <TableHead>{t('settings.spaces.columns.host')}</TableHead>
                    <TableHead aria-label={t('settings.spaces.columns.actions')} className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(row => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      onRemoveRequest={onRemoveRequest}
                      busy={busy}
                      removeAriaLabel={t('settings.spaces.removeAria', { name: row.name })}
                      dragHandleAriaLabel={t('settings.spaces.dragHandle')}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
