import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useFlowStateSearch } from './useFlowStateSearch';

// 021 DEP-021-SEARCH: the native `search` root is WP-SRCH1's and not served yet, so the hook sends nothing
// (its module imports no Apollo hook at all) and a search renders the existing inline error state.
describe('useFlowStateSearch before WP-SRCH1', () => {
  test('a search shows the error state with no results, no paging and no cursor', () => {
    const { result } = renderHook(() =>
      useFlowStateSearch({ flowStateID: 'flow-state', spaceID: 'space', terms: ['governance'] })
    );
    expect(result.current).toMatchObject({ status: 'error', results: [], appending: false, hasMore: false });
    expect(() => result.current.retry()).not.toThrow();
  });

  test('browsing (skipped) and an unresolved flow state show no results, not an error', () => {
    expect(
      renderHook(() => useFlowStateSearch({ flowStateID: 'flow-state', terms: [], skip: true })).result.current.status
    ).toBe('empty');
    expect(renderHook(() => useFlowStateSearch({ flowStateID: undefined, terms: ['x'] })).result.current.status).toBe(
      'empty'
    );
  });
});
