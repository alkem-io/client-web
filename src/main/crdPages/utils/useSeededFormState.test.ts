import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useSeededFormState } from './useSeededFormState';

type Values = { name: string };
const EMPTY: Values = { name: '' };

describe('useSeededFormState', () => {
  test('does not seed until the source is ready', () => {
    let seed: Values = { name: 'A' };
    const { result, rerender } = renderHook(
      ({ ready }) => useSeededFormState({ seedKey: 'a', ready, computeSeed: () => seed, empty: EMPTY }),
      { initialProps: { ready: false } }
    );
    expect(result.current.seeded).toBe(false);
    expect(result.current.values).toEqual(EMPTY);

    seed = { name: 'A' };
    rerender({ ready: true });
    expect(result.current.seeded).toBe(true);
    expect(result.current.values).toEqual({ name: 'A' });
  });

  test('re-seeds (and clears dirtiness) when the target id changes — guards against editing the wrong entity', () => {
    let seed: Values = { name: 'A' };
    const { result, rerender } = renderHook(
      ({ seedKey }) => useSeededFormState({ seedKey, ready: true, computeSeed: () => seed, empty: EMPTY }),
      { initialProps: { seedKey: 'a' } }
    );
    expect(result.current.values).toEqual({ name: 'A' });

    // Admin edits target A → form becomes dirty.
    act(() => result.current.setValues({ name: 'edited-A' }));
    expect(result.current.isDirty).toBe(true);

    // Navigate to target B (same page instance reused across the param change).
    seed = { name: 'B' };
    rerender({ seedKey: 'b' });

    // Must show B's data, not A's stale edited values, and be clean again.
    expect(result.current.values).toEqual({ name: 'B' });
    expect(result.current.isDirty).toBe(false);
  });

  test('tracks dirtiness against the seeded snapshot', () => {
    const seed: Values = { name: 'A' };
    const { result } = renderHook(() =>
      useSeededFormState({ seedKey: 'a', ready: true, computeSeed: () => seed, empty: EMPTY })
    );
    expect(result.current.isDirty).toBe(false);
    act(() => result.current.setValues({ name: 'A2' }));
    expect(result.current.isDirty).toBe(true);
    act(() => result.current.setValues({ name: 'A' }));
    expect(result.current.isDirty).toBe(false);
  });
});
