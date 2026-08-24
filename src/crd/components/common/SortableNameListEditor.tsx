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
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

/** A single named row managed by the editor. `id` is stable; `name` is user-editable. */
export type NameListItem = {
  id: string;
  name: string;
  /** When false, the row's delete control is disabled (e.g. a protected first entry). */
  deletable?: boolean;
  /** Optional tooltip surfaced on a disabled delete control. */
  deleteDisabledReason?: string;
};

export type SortableNameListEditorProps = {
  items: NameListItem[];
  /** Rename a row. Validation lives with the consumer; the field shows `errorFor` inline. */
  onRename: (id: string, name: string) => void;
  /** Reorder — called with the full new id order after a drag or keyboard move. */
  onReorder: (orderedIds: string[]) => void;
  /** Delete a row. Only wired on rows whose `deletable` is not false. */
  onDelete: (id: string) => void;
  /** Add a new empty row (the consumer decides the seed name / opens its own flow). */
  onAdd: () => void;
  /** Per-row validation message, keyed by row id. When set, the row renders it and marks the input invalid. */
  errorFor?: (id: string) => string | undefined;
  addLabel: string;
  /** Accessible label for the drag handle (same for every row). */
  dragLabel: string;
  /** Accessible label for the delete control (same for every row). */
  deleteLabel: string;
  namePlaceholder?: string;
  /** Accessible label for each name input. */
  nameLabel: string;
  /** Caps the row count; the Add control disables at the cap. */
  maxItems?: number;
  className?: string;
};

/**
 * Content-agnostic sortable list of named rows: add, rename, reorder (pointer +
 * keyboard), and delete. Purely presentational — every mutation is a prop
 * callback and every string is passed in, so the same editor drives any
 * "editable list of names" surface. The dnd + keyboard-sensor setup mirrors the
 * space-settings layout editor without depending on its phase/callout model.
 */
export function SortableNameListEditor({
  items,
  onRename,
  onReorder,
  onDelete,
  onAdd,
  errorFor,
  addLabel,
  dragLabel,
  deleteLabel,
  namePlaceholder,
  nameLabel,
  maxItems = Number.POSITIVE_INFINITY,
  className,
}: SortableNameListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = items.findIndex(item => item.id === active.id);
    const toIndex = items.findIndex(item => item.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;
    onReorder(arrayMove(items, fromIndex, toIndex).map(item => item.id));
  };

  const canAdd = items.length < maxItems;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {items.map(item => (
              <SortableRow
                key={item.id}
                item={item}
                error={errorFor?.(item.id)}
                dragLabel={dragLabel}
                deleteLabel={deleteLabel}
                namePlaceholder={namePlaceholder}
                nameLabel={nameLabel}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" size="sm" className="gap-2 self-start" disabled={!canAdd} onClick={onAdd}>
        <Plus aria-hidden="true" className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}

type SortableRowProps = {
  item: NameListItem;
  error?: string;
  dragLabel: string;
  deleteLabel: string;
  namePlaceholder?: string;
  nameLabel: string;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

function SortableRow({
  item,
  error,
  dragLabel,
  deleteLabel,
  namePlaceholder,
  nameLabel,
  onRename,
  onDelete,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  const deletable = item.deletable !== false;
  const errorId = `${item.id}-error`;

  return (
    <li ref={setNodeRef} style={style} className={cn('flex flex-col gap-1', isDragging && 'opacity-50')}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={dragLabel}
          className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <Input
          value={item.name}
          onChange={e => onRename(item.id, e.target.value)}
          placeholder={namePlaceholder}
          aria-label={nameLabel}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={deleteLabel}
          title={deletable ? undefined : item.deleteDisabledReason}
          disabled={!deletable}
          className="shrink-0 text-destructive focus:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {error && (
        <p id={errorId} className="text-caption text-destructive pl-8">
          {error}
        </p>
      )}
    </li>
  );
}
