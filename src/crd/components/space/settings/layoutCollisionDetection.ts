import { type CollisionDetection, closestCenter } from '@dnd-kit/core';

/** Sortable ids of phase columns carry this prefix; every other droppable is a callout or a column's drop zone. */
export const COLUMN_SORTABLE_PREFIX = 'col:';

/**
 * A dragged column may only land on another column. Without the filter, a column moved over a
 * column that holds callouts collides with a callout, and the drop resolves to no column at all.
 */
export const layoutCollisionDetection: CollisionDetection = args =>
  args.active.data.current?.type === 'column'
    ? closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(container =>
          String(container.id).startsWith(COLUMN_SORTABLE_PREFIX)
        ),
      })
    : closestCenter(args);
