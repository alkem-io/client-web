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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

export type SortableContribution = {
  id: string;
  title: string;
};

type CalloutContributionsSortDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contributions: SortableContribution[];
  onConfirm: (sortedIds: string[]) => void | Promise<void>;
  loading?: boolean;
};

/**
 * CRD port of the MUI `CalloutContributionsSortDialog`. Plain drag-and-drop
 * reorder list built on `@dnd-kit/sortable` (same primitive used by
 * `PollOptionsEditor`). Parent receives the final order on confirm (plan D11 /
 * T070).
 */
export function CalloutContributionsSortDialog({
  open,
  onOpenChange,
  contributions,
  onConfirm,
  loading = false,
}: CalloutContributionsSortDialogProps) {
  const { t } = useTranslation('crd-space');
  const [items, setItems] = useState<SortableContribution[]>(contributions);

  // Seed `items` once per open cycle, the first time real data is available.
  // The parent fires the GraphQL query on open (`skip: !sortOpen`), so the
  // first render after open passes an empty array; this effect re-runs when
  // the data arrives. After seeding, unrelated parent re-renders that hand a
  // new `contributions` reference (e.g. cache updates) won't wipe an
  // in-progress drag reorder.
  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (!open) {
      hasSeededRef.current = false;
      return;
    }
    if (!hasSeededRef.current && contributions.length > 0) {
      setItems(contributions);
      hasSeededRef.current = true;
    }
  }, [open, contributions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-lg z-[80]">
        <DialogHeader>
          <DialogTitle>{t('sortContributions.title')}</DialogTitle>
          <DialogDescription>{t('sortContributions.description')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6 py-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {items.map(item => (
                  <SortableRow key={item.id} item={item} disabled={loading} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          {loading && items.length === 0 && (
            <output className="flex justify-center py-4" aria-label={t('sortContributions.title')}>
              <Loader2 aria-hidden="true" className="size-4 animate-spin text-muted-foreground" />
            </output>
          )}
          {!loading && items.length === 0 && (
            <p className="text-caption text-muted-foreground py-4">{t('sortContributions.empty')}</p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild={true}>
            <Button variant="outline" disabled={loading}>
              {t('dialogs.cancel')}
            </Button>
          </DialogClose>
          <Button
            onClick={() => onConfirm(items.map(i => i.id))}
            disabled={loading || items.length === 0}
            aria-busy={loading}
          >
            {loading && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {t('sortContributions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableRow({ item, disabled }: { item: SortableContribution; disabled: boolean }) {
  const { t } = useTranslation('crd-space');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-background',
        isDragging && 'shadow-md ring-2 ring-ring/50'
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={t('sortContributions.dragHandle')}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" aria-hidden="true" />
      </button>
      <span className="text-body text-foreground truncate">{item.title}</span>
    </li>
  );
}
