import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn } from '@/crd/lib/utils';
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
  onAddTask?: (column: string) => void;
  onOpenTask?: (cardId: string) => void;
  /** Called on a drop into a different column. Same-column drops do not fire. */
  onMoveTask?: (cardId: string, toColumn: string) => void;
};

/** A draggable card. When dragging is disabled it renders as a plain card. */
function DraggableCard({
  card,
  column,
  draggable,
  onOpenTask,
}: {
  card: TaskBoardCardModel;
  column: string;
  draggable: boolean;
  onOpenTask?: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { fromColumn: column },
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(draggable && 'cursor-grab', isDragging && 'opacity-50')}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
    >
      <TaskCard
        title={card.title}
        author={card.author}
        description={card.description}
        tags={card.tags}
        commentCount={card.commentCount}
        onClick={onOpenTask ? () => onOpenTask(card.id) : undefined}
      />
    </div>
  );
}

/** A column whose body is a drop target. */
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
  const { setNodeRef, isOver } = useDroppable({ id: column.name, data: { column: column.name } });

  return (
    <div ref={setNodeRef} className={cn('flex min-h-0', isOver && canMove && 'ring-2 ring-ring rounded-lg')}>
      <TaskBoardColumn
        name={column.name}
        count={column.count}
        addLabel={addLabel}
        onAdd={canAdd && onAddTask ? () => onAddTask(column.name) : undefined}
        emptyLabel={emptyLabel}
      >
        {column.cards.map(card => (
          <DraggableCard key={card.id} card={card} column={column.name} draggable={canMove} onOpenTask={onOpenTask} />
        ))}
      </TaskBoardColumn>
    </div>
  );
}

/**
 * Presentational board: a horizontal, non-wrapping row of columns in the given
 * order, each grouping its cards. Drag/drop is UI-only here — a cross-column
 * drop calls `onMoveTask`; the connector owns the mutation and cache update.
 * Affordances are driven purely by the privilege props.
 */
export function TaskBoardView({
  columns,
  canAdd = false,
  canMove = false,
  addLabel,
  emptyLabel,
  onAddTask,
  onOpenTask,
  onMoveTask,
}: TaskBoardViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onMoveTask) return;
    const cardId = String(event.active.id);
    const fromColumn = event.active.data.current?.fromColumn as string | undefined;
    const toColumn = event.over?.data.current?.column as string | undefined;
    if (!toColumn || toColumn === fromColumn) return;
    onMoveTask(cardId, toColumn);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto max-h-[70vh] pb-2">
        {columns.map(column => (
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
    </DndContext>
  );
}
