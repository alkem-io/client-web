import type { ClientRect, DroppableContainer } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';
import { layoutCollisionDetection } from './layoutCollisionDetection';

const rect = (left: number): ClientRect => ({ left, top: 0, width: 100, height: 100, right: left + 100, bottom: 100 });

const container = (id: string): DroppableContainer =>
  ({
    id,
    key: id,
    data: { current: undefined },
    disabled: false,
    node: { current: null },
    rect: { current: null },
  }) as DroppableContainer;

// Column A at x=0 holds a callout card right where the dragged column is; column B sits further away.
const droppableRects = new Map([
  ['col:a', rect(0)],
  ['callout-1', rect(300)],
  ['col:b', rect(600)],
]);
const droppableContainers = [...droppableRects.keys()].map(container);

const detect = (type: 'column' | 'callout') =>
  layoutCollisionDetection({
    active: { id: 'dragged', data: { current: { type } }, rect: { current: { initial: null, translated: null } } },
    collisionRect: rect(300),
    droppableRects,
    droppableContainers,
    pointerCoordinates: null,
  });

describe('layoutCollisionDetection', () => {
  it('a dragged column only collides with columns, even over a callout', () => {
    const ids = detect('column').map(c => c.id);
    expect(ids).not.toContain('callout-1');
    expect(ids.every(id => String(id).startsWith('col:'))).toBe(true);
  });

  it('a dragged callout still collides with callouts', () => {
    expect(detect('callout')[0].id).toBe('callout-1');
  });
});
