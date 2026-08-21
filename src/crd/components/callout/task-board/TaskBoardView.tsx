import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
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

/** Where a dragged card would land: a column and the insertion index within it. */
type DropIndicator = { column: string; index: number };

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
  /** Called on a drop into a different column. Same-column drops do not fire. */
  onMoveTask?: (cardId: string, toColumn: string) => void;
};

/**
 * A draggable card. The whole card is the drag surface (a click still opens the
 * task — the pointer sensor only starts a drag past a small threshold), and it
 * doubles as a drop target so the board can compute an inter-item insertion
 * point. When dragging is disabled it renders as a plain card.
 */
function DraggableCard({
  card,
  column,
  index,
  draggable,
  onOpenTask,
}: {
  card: TaskBoardCardModel;
  column: string;
  index: number;
  draggable: boolean;
  onOpenTask?: (cardId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: card.id,
    data: { fromColumn: column, index },
    disabled: !draggable,
  });
  // The card is also a droppable so a drag hovering it yields a precise
  // insertion index (before/after resolved by the board from the cursor).
  const { setNodeRef: setDropRef } = useDroppable({
    id: `card:${card.id}`,
    data: { column, index, cardId: card.id },
    disabled: !draggable,
  });

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={setRefs}
      className={cn(draggable && 'cursor-grab', isDragging && 'opacity-30')}
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

/** A thin line marking where a dragged card would be inserted. */
function DropLine() {
  return <div aria-hidden="true" className="h-0.5 -my-0.5 rounded-full bg-primary" />;
}

/** A column whose body (and each card) is a drop target. */
function DroppableColumn({
  column,
  canAdd,
  canMove,
  addLabel,
  emptyLabel,
  indicator,
  onAddTask,
  onOpenTask,
}: {
  column: TaskBoardColumnModel;
  canAdd: boolean;
  canMove: boolean;
  addLabel?: string;
  emptyLabel?: string;
  indicator: DropIndicator | null;
  onAddTask?: (column: string) => void;
  onOpenTask?: (cardId: string) => void;
}) {
  // The column body catches drops below the last card (insertion at the end).
  const { setNodeRef, isOver } = useDroppable({
    id: column.name,
    data: { column: column.name, index: column.cards.length },
  });

  const showLineAt = (i: number) => indicator?.column === column.name && indicator.index === i;

  // Interleave the insertion line with the cards so it sits between items.
  const body: React.ReactNode[] = [];
  column.cards.forEach((card, i) => {
    if (showLineAt(i)) body.push(<DropLine key={`line-${i}`} />);
    body.push(
      <DraggableCard
        key={card.id}
        card={card}
        column={column.name}
        index={i}
        draggable={canMove}
        onOpenTask={onOpenTask}
      />
    );
  });
  if (showLineAt(column.cards.length)) body.push(<DropLine key="line-end" />);

  return (
    <div ref={setNodeRef} className={cn('flex min-h-0', isOver && canMove && 'rounded-lg ring-2 ring-ring/40')}>
      <TaskBoardColumn
        name={column.name}
        count={column.count}
        addLabel={addLabel}
        onAdd={canAdd && onAddTask ? () => onAddTask(column.name) : undefined}
        emptyLabel={emptyLabel}
      >
        {body}
      </TaskBoardColumn>
    </div>
  );
}

/**
 * Presentational board: a horizontal, non-wrapping row of columns in the given
 * order, each grouping its cards. Drag/drop is UI-only here — a drop into a
 * different column calls `onMoveTask`; the connector owns the mutation and cache
 * update. A live insertion line follows the cursor between items (intra-column
 * order is a visual affordance; only the column assignment is persisted). The
 * board can be expanded to a fullscreen overlay. Affordances are driven purely
 * by the privilege props.
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
}: TaskBoardViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCard, setActiveCard] = useState<TaskBoardCardModel | null>(null);
  const [indicator, setIndicator] = useState<DropIndicator | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    for (const column of columns) {
      const found = column.cards.find(card => card.id === id);
      if (found) {
        setActiveCard(found);
        return;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    const overData = over?.data.current as { column?: string; index?: number; cardId?: string } | undefined;
    if (!over || !overData?.column) {
      setIndicator(null);
      return;
    }
    let index = overData.index ?? 0;
    // Over a card: insert before it, or after it when the dragged card's centre
    // has passed the target's centre — fine-grained inter-item positioning.
    if (overData.cardId !== undefined) {
      const activeRect = event.active.rect.current.translated;
      const overRect = over.rect;
      if (activeRect && activeRect.top + activeRect.height / 2 > overRect.top + overRect.height / 2) {
        index += 1;
      }
    }
    setIndicator({ column: overData.column, index });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const cardId = String(event.active.id);
    const fromColumn = event.active.data.current?.fromColumn as string | undefined;
    const toColumn = indicator?.column ?? (event.over?.data.current?.column as string | undefined);
    setActiveCard(null);
    setIndicator(null);
    if (!onMoveTask || !toColumn || toColumn === fromColumn) return;
    onMoveTask(cardId, toColumn);
  };

  const handleDragCancel = () => {
    setActiveCard(null);
    setIndicator(null);
  };

  const content = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
        {columns.map(column => (
          <DroppableColumn
            key={column.name}
            column={column}
            canAdd={canAdd}
            canMove={canMove}
            addLabel={addLabel}
            emptyLabel={emptyLabel}
            indicator={indicator}
            onAddTask={onAddTask}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      <DragOverlay>
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
      </DragOverlay>
    </DndContext>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background p-4">{content}</div>;
  }
  return content;
}
