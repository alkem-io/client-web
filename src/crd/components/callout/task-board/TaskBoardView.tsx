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
  /** When false, the add/drag affordances are hidden (read-only board). */
  canAdd?: boolean;
  addLabel?: string;
  emptyLabel?: string;
  onAddTask?: (column: string) => void;
  onOpenTask?: (cardId: string) => void;
  /** Slot rendered by the connector to wrap cards/columns with dnd behavior. */
  renderCard?: (card: TaskBoardCardModel, column: string, defaultCard: React.ReactNode) => React.ReactNode;
  renderColumnBody?: (column: string, body: React.ReactNode) => React.ReactNode;
};

/**
 * Presentational board: a horizontal, non-wrapping row of columns in the given
 * order, each grouping its cards. Drag/drop and data mapping live in the
 * connector; this view only lays out columns and cards and forwards prop
 * callbacks. Affordances are driven purely by the privilege props.
 */
export function TaskBoardView({
  columns,
  canAdd = false,
  addLabel,
  emptyLabel,
  onAddTask,
  onOpenTask,
  renderCard,
  renderColumnBody,
}: TaskBoardViewProps) {
  return (
    <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto max-h-[70vh] pb-2">
      {columns.map(column => {
        const cards = column.cards.map(card => {
          const defaultCard = (
            <TaskCard
              title={card.title}
              author={card.author}
              description={card.description}
              tags={card.tags}
              commentCount={card.commentCount}
              onClick={onOpenTask ? () => onOpenTask(card.id) : undefined}
            />
          );
          const content = renderCard ? renderCard(card, column.name, defaultCard) : defaultCard;
          return <div key={card.id}>{content}</div>;
        });
        const body = renderColumnBody ? renderColumnBody(column.name, cards) : cards;

        return (
          <TaskBoardColumn
            key={column.name}
            name={column.name}
            count={column.count}
            addLabel={addLabel}
            onAdd={canAdd && onAddTask ? () => onAddTask(column.name) : undefined}
            emptyLabel={emptyLabel}
          >
            {body}
          </TaskBoardColumn>
        );
      })}
    </div>
  );
}
