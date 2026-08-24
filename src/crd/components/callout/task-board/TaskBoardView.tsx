import {
  type CollisionDetection,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  TouchSensor,
  useDroppable,
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
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { TaskBoardColumn } from './TaskBoardColumn';
import { TaskCard } from './TaskCard';

export type TaskBoardCardModel = {
  id: string;
  title: string;
  author?: { name: string; avatarUrl?: string };
  description?: string;
  tags?: string[];
  commentCount?: number;
};

export type TaskBoardColumnModel = {
  name: string;
  /** Server-authoritative count for the header badge. */
  count: number;
  cards: TaskBoardCardModel[];
};

export type TaskBoardViewProps = {
  columns: TaskBoardColumnModel[];
  /** When true, per-column add affordances are shown. */
  canAdd?: boolean;
  /** When true, cards are draggable between columns. */
  canMove?: boolean;
  addLabel?: string;
  emptyLabel?: string;
  /** Accessible label for the expand-to-fullscreen control. */
  expandLabel?: string;
  /** Accessible label for the collapse control shown while fullscreen. */
  collapseLabel?: string;
  onAddTask?: (column: string) => void;
  onOpenTask?: (cardId: string) => void;
  /**
   * Called on a drop into a different column. Receives the destination column and
   * every card id in the board's new top-to-bottom, column-by-column order, so the
   * connector can both re-tag the card's column and land it at the dropped
   * position. Same-column drops fire `onReorder` instead.
   */
  onMoveTask?: (cardId: string, toColumn: string, orderedCardIds: string[]) => void;
  /**
   * Called on a within-column reorder (the drop stays in the same column but at a
   * new position). Receives every card id in the board's new top-to-bottom,
   * column-by-column order — the full order the connector persists. A drop into a
   * different column fires `onMoveTask` instead, not this.
   */
  onReorder?: (orderedCardIds: string[]) => void;
};

/** Prefix for a column's droppable id so it never collides with a card id. */
const COLUMN_DROPPABLE_PREFIX = 'col:';

/**
 * Pointer-first collision detection. Columns are full-height droppables, so
 * `closestCorners` alone mis-resolves: a short dragged card's corners stay
 * closer to its own (equally short) source droppable than to a tall target
 * column whose bottom corners are hundreds of px away — the card never "enters"
 * another column. `pointerWithin` instead asks which droppable the pointer is
 * literally inside, which is exactly right for a kanban board. It has no result
 * for keyboard dragging (no pointer), so fall back to `closestCorners` then.
 */
const boardCollisionDetection: CollisionDetection = args => {
  const pointerHits = pointerWithin(args);
  return pointerHits.length > 0 ? pointerHits : closestCorners(args);
};

const findColumnOfCard = (columns: TaskBoardColumnModel[], cardId: string): TaskBoardColumnModel | undefined =>
  columns.find(column => column.cards.some(card => card.id === cardId));

/**
 * A sortable card. `useSortable` applies the shift transform to the node so
 * siblings visibly move aside and the source fades in place as a placeholder,
 * while a `DragOverlay` (portaled to <body>, see `TaskBoardView`) carries the
 * floating clone that tracks the cursor. The whole card is the drag surface — a
 * click still opens the task, since the pointer sensor only starts a drag past a
 * small threshold. When dragging is disabled it renders as a plain card.
 */
function SortableCard({
  card,
  draggable,
  onOpenTask,
}: {
  card: TaskBoardCardModel;
  draggable: boolean;
  onOpenTask?: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
    disabled: !draggable,
  });

  // The overlay carries the floating visual, so the in-list node just moves to
  // its slot (transform from the sorting strategy) and fades to read as the
  // drop placeholder.
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(draggable && 'cursor-grab touch-none', isDragging && 'opacity-40')}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
    >
      <TaskCard
        title={card.title}
        author={card.author}
        description={card.description}
        tags={card.tags}
        commentCount={card.commentCount}
        dragHandleSlot={draggable ? <GripVertical className="size-4" aria-hidden="true" /> : undefined}
        onClick={onOpenTask ? () => onOpenTask(card.id) : undefined}
      />
    </div>
  );
}

/** A column whose body is a sortable context and whose whole area is a drop target. */
function DroppableColumn({
  column,
  canAdd,
  canMove,
  addLabel,
  emptyLabel,
  onAddTask,
  onOpenTask,
}: {
  column: TaskBoardColumnModel;
  canAdd: boolean;
  canMove: boolean;
  addLabel?: string;
  emptyLabel?: string;
  onAddTask?: (column: string) => void;
  onOpenTask?: (cardId: string) => void;
}) {
  // The column is a droppable so a drag over an empty column (with no card to
  // collide with) still resolves to a column target.
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_DROPPABLE_PREFIX}${column.name}`,
    data: { type: 'column', column: column.name },
  });

  return (
    <div ref={setNodeRef} className={cn('flex min-h-0', isOver && canMove && 'rounded-lg ring-2 ring-ring/40')}>
      <TaskBoardColumn
        name={column.name}
        count={column.count}
        addLabel={addLabel}
        onAdd={canAdd && onAddTask ? () => onAddTask(column.name) : undefined}
        emptyLabel={emptyLabel}
      >
        {column.cards.length > 0 ? (
          <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
            {column.cards.map(card => (
              <SortableCard key={card.id} card={card} draggable={canMove} onOpenTask={onOpenTask} />
            ))}
          </SortableContext>
        ) : null}
      </TaskBoardColumn>
    </div>
  );
}

/**
 * Presentational board: a horizontal, non-wrapping row of columns in the given
 * order, each grouping its cards. Drag/drop is UI-only here — a drop into a
 * different column calls `onMoveTask`, a within-column reorder calls `onReorder`;
 * the connector owns the mutations and cache updates. During a drag a local draft
 * of the columns is rendered so the card visibly moves between columns and
 * siblings shift aside. The board can be expanded to a fullscreen overlay.
 * Affordances are driven purely by the privilege props.
 */
export function TaskBoardView({
  columns,
  canAdd = false,
  canMove = false,
  addLabel,
  emptyLabel,
  expandLabel,
  collapseLabel,
  onAddTask,
  onOpenTask,
  onMoveTask,
  onReorder,
}: TaskBoardViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCard, setActiveCard] = useState<TaskBoardCardModel | null>(null);
  // A working copy of the columns, live only during a drag, so the dragged card
  // can be relocated across columns for the visual. Null when not dragging, in
  // which case the authoritative `columns` prop renders.
  const [draftColumns, setDraftColumns] = useState<TaskBoardColumnModel[] | null>(null);
  // The column the active card started in, captured at drag start so drag-end
  // can tell whether the column actually changed.
  const fromColumnRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const view = draftColumns ?? columns;

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const source = findColumnOfCard(columns, id);
    fromColumnRef.current = source?.name ?? null;
    setActiveCard(source?.cards.find(card => card.id === id) ?? null);
    // Snapshot the current layout as the mutable draft for the drag's duration.
    setDraftColumns(columns.map(column => ({ ...column, cards: [...column.cards] })));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    setDraftColumns(prev => {
      const cols = (prev ?? columns).map(column => ({ ...column, cards: [...column.cards] }));
      const activeColumn = cols.find(column => column.cards.some(card => card.id === activeId));
      if (!activeColumn) return prev;

      // Resolve the column being hovered: either a column droppable (empty-column
      // drop) or the column that owns the card under the cursor.
      let overColumn: TaskBoardColumnModel | undefined;
      let overIndex: number;
      if (overId.startsWith(COLUMN_DROPPABLE_PREFIX)) {
        const name = overId.slice(COLUMN_DROPPABLE_PREFIX.length);
        overColumn = cols.find(column => column.name === name);
        overIndex = overColumn ? overColumn.cards.length : -1;
      } else {
        overColumn = cols.find(column => column.cards.some(card => card.id === overId));
        overIndex = overColumn ? overColumn.cards.findIndex(card => card.id === overId) : -1;
      }
      if (!overColumn) return prev;
      // Same column: do NOT mutate the list here. The sorting strategy renders
      // the gap visually, and the final order is computed once on drop. Moving
      // cards on every same-column hover re-registers droppables and makes
      // dnd-kit's rect measuring thrash (an infinite render loop).
      if (overColumn.name === activeColumn.name) return prev;

      const activeIndex = activeColumn.cards.findIndex(card => card.id === activeId);
      const [moved] = activeColumn.cards.splice(activeIndex, 1);
      const insertAt = overIndex < 0 ? overColumn.cards.length : overIndex;
      overColumn.cards.splice(insertAt, 0, moved);
      return cols;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const draft = draftColumns ?? columns;
    const toColumn = findColumnOfCard(draft, activeId)?.name;
    const fromColumn = fromColumnRef.current;
    setActiveCard(null);
    setDraftColumns(null);
    fromColumnRef.current = null;
    if (!toColumn) return;

    // Resolve the card's final slot within its destination column from the drop
    // target. `handleDragOver` only ever moves a card ACROSS columns (and drops it
    // at the row it first crossed into) and leaves same-column order untouched, so
    // the exact within-column index — for both a reorder and the position half of
    // a cross-column move — is computed here from `over`.
    const column = draft.find(entry => entry.name === toColumn);
    if (!column) return;
    const activeIndex = column.cards.findIndex(card => card.id === activeId);
    const overIndex =
      !overId || overId.startsWith(COLUMN_DROPPABLE_PREFIX)
        ? column.cards.length - 1
        : column.cards.findIndex(card => card.id === overId);
    const targetIndex = overIndex < 0 ? column.cards.length - 1 : overIndex;
    const finalCards =
      activeIndex < 0 || targetIndex === activeIndex ? column.cards : arrayMove(column.cards, activeIndex, targetIndex);
    const orderedIds = draft.flatMap(entry =>
      entry.name === toColumn ? finalCards.map(card => card.id) : entry.cards.map(card => card.id)
    );

    // A cross-column drop re-tags the column and persists the dropped position
    // together (the connector sequences the two mutations).
    if (toColumn !== fromColumn) {
      onMoveTask?.(activeId, toColumn, orderedIds);
      return;
    }

    // A within-column drop persists the new order only if it actually changed.
    if (!onReorder) return;
    const originalIds = columns.flatMap(entry => entry.cards.map(card => card.id));
    if (orderedIds.length === originalIds.length && orderedIds.every((id, index) => id === originalIds[index])) {
      return;
    }
    onReorder(orderedIds);
  };

  const handleDragCancel = () => {
    setActiveCard(null);
    setDraftColumns(null);
    fromColumnRef.current = null;
  };

  const board = (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="mb-2 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          aria-label={isFullscreen ? collapseLabel : expandLabel}
          aria-pressed={isFullscreen}
          onClick={() => setIsFullscreen(prev => !prev)}
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      <div
        className={cn(
          'flex flex-row flex-nowrap gap-3 overflow-x-auto pb-2',
          isFullscreen ? 'min-h-0 flex-1' : 'max-h-[70vh]'
        )}
      >
        {view.map(column => (
          <DroppableColumn
            key={column.name}
            column={column}
            canAdd={canAdd}
            canMove={canMove}
            addLabel={addLabel}
            emptyLabel={emptyLabel}
            onAddTask={onAddTask}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      {/*
        The overlay carries the floating card that tracks the cursor. It is
        `position: fixed`, but a feed ancestor of the callout establishes a
        containing block, which would trap the overlay and offset it far from the
        pointer. Portaling it to <body> (React context still flows through the
        portal, so it stays wired to this DndContext) lets its fixed positioning
        resolve against the viewport, so it follows the cursor 1:1. In fullscreen
        the board already lives at <body>, so this is a harmless no-op there.
      */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <TaskCard
              title={activeCard.title}
              author={activeCard.author}
              description={activeCard.description}
              tags={activeCard.tags}
              commentCount={activeCard.commentCount}
              dragHandleSlot={<GripVertical className="size-4" aria-hidden="true" />}
              className="cursor-grabbing shadow-lg ring-1 ring-ring/40"
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  // A feed ancestor establishes a containing block (content-visibility / a
  // transform), which traps `position: fixed` so a plain fixed overlay only
  // covers the callout, not the viewport. Portal the fullscreen layer to
  // <body> so it reliably fills the screen. Inline, the board renders in place.
  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-background p-4">{board}</div>,
      document.body
    );
  }
  return <div className="flex flex-col">{board}</div>;
}
