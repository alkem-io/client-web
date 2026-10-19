import { describe, expect, it } from 'vitest';
import { selectFirstFlowState } from './selectFirstFlowState';

const A1 = 'a1000000-0000-4000-8000-000000000001';
const B2 = 'b2000000-0000-4000-8000-000000000002';
const C3 = 'c3000000-0000-4000-8000-000000000003';

describe('selectFirstFlowState', () => {
  it('picks the lowest (sortOrder, id) state (shared vector V1)', () => {
    const states = [
      { id: B2, sortOrder: 10, visible: false },
      { id: A1, sortOrder: 10, visible: true },
      { id: C3, sortOrder: 20, visible: true },
    ];
    expect(selectFirstFlowState(states)?.id).toBe(A1);
  });

  it('keeps a hidden first state first (shared vector V2)', () => {
    const states = [
      { id: B2, sortOrder: 10, visible: false },
      { id: A1, sortOrder: 10, visible: false },
      { id: C3, sortOrder: 20, visible: true },
    ];
    expect(selectFirstFlowState(states)?.id).toBe(A1);
  });

  it('normalizes uppercase ids before comparing (shared vector V3)', () => {
    expect(
      selectFirstFlowState([
        { id: B2.toUpperCase(), sortOrder: 5 },
        { id: A1, sortOrder: 5 },
      ])?.id
    ).toBe(A1);
  });

  it('does not depend on input order and never mutates the input (shared vector V4)', () => {
    const states = [
      { id: C3, sortOrder: 20 },
      { id: B2, sortOrder: 10 },
      { id: A1, sortOrder: 10 },
    ];
    const snapshot = [...states];
    expect(selectFirstFlowState(states)?.id).toBe(A1);
    expect(selectFirstFlowState([...states].reverse())?.id).toBe(A1);
    expect(states).toEqual(snapshot);
  });

  it('returns undefined for no states', () => {
    expect(selectFirstFlowState(undefined)).toBeUndefined();
    expect(selectFirstFlowState([])).toBeUndefined();
  });
});
