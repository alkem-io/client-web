import { describe, expect, it } from 'vitest';
import { sortBySortOrder } from './sortBySortOrder';

const A1 = 'a1000000-0000-4000-8000-000000000001';
const B2 = 'b2000000-0000-4000-8000-000000000002';
const C3 = 'c3000000-0000-4000-8000-000000000003';

describe('sortBySortOrder', () => {
  it('orders by sortOrder, then id ascending (shared vector V1)', () => {
    const states = [
      { id: B2, sortOrder: 10, visible: false },
      { id: A1, sortOrder: 10, visible: true },
      { id: C3, sortOrder: 20, visible: true },
    ];
    expect([...states].sort(sortBySortOrder).map(s => s.id)).toEqual([A1, B2, C3]);
  });

  it('ignores visibility (shared vector V2)', () => {
    const states = [
      { id: B2, sortOrder: 10, visible: false },
      { id: A1, sortOrder: 10, visible: false },
      { id: C3, sortOrder: 20, visible: true },
    ];
    expect([...states].sort(sortBySortOrder).map(s => s.id)).toEqual([A1, B2, C3]);
  });

  it('compares ids lowercased (shared vector V3)', () => {
    const states = [
      { id: B2.toUpperCase(), sortOrder: 5 },
      { id: A1, sortOrder: 5 },
    ];
    expect([...states].sort(sortBySortOrder).map(s => s.id)).toEqual([A1, B2.toUpperCase()]);
  });

  it('does not depend on input order (shared vector V4)', () => {
    const states = [
      { id: C3, sortOrder: 20 },
      { id: A1, sortOrder: 10 },
      { id: B2, sortOrder: 10 },
    ];
    expect([...states].sort(sortBySortOrder).map(s => s.id)).toEqual([A1, B2, C3]);
    expect(
      [...states]
        .reverse()
        .sort(sortBySortOrder)
        .map(s => s.id)
    ).toEqual([A1, B2, C3]);
  });

  it('keeps plain sortOrder ordering for objects without an id', () => {
    expect([{ sortOrder: 3 }, { sortOrder: 1 }, { sortOrder: 2 }].sort(sortBySortOrder)).toEqual([
      { sortOrder: 1 },
      { sortOrder: 2 },
      { sortOrder: 3 },
    ]);
  });
});
