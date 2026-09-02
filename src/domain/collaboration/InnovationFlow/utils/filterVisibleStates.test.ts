import { describe, expect, test } from 'vitest';
import { filterVisibleStates } from './filterVisibleStates';

const state = (id: string, visible?: boolean) => ({ id, settings: { allowNewCallouts: true, visible } });

describe('filterVisibleStates', () => {
  test('keeps only phases whose visible is not false', () => {
    const visibleA = state('a', true);
    const hiddenB = state('b', false);
    const result = filterVisibleStates([visibleA, hiddenB]);
    expect(result).toEqual([visibleA]);
  });

  test('treats undefined visible as shown when capability is present', () => {
    const known = state('a', false);
    const legacy = state('b', undefined);
    // capability is present (state a carries a boolean), so legacy undefined stays visible
    expect(filterVisibleStates([known, legacy])).toEqual([legacy]);
  });

  test('is a no-op when no phase carries a boolean visible (capability absent)', () => {
    const states = [state('a', undefined), state('b', undefined)];
    expect(filterVisibleStates(states)).toEqual(states);
  });

  test('returns an empty list when every phase is hidden', () => {
    const states = [state('a', false), state('b', false)];
    expect(filterVisibleStates(states)).toEqual([]);
  });
});
