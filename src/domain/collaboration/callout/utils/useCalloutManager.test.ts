import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const updateVisibilityOptions = vi.fn();
const deleteCalloutOptions = vi.fn();

vi.mock('@apollo/client', () => ({ useApolloClient: () => ({}) }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  CalloutFragmentDoc: {},
  useUpdateCalloutVisibilityMutation: (options: unknown) => {
    updateVisibilityOptions(options);
    return [vi.fn()];
  },
  useDeleteCalloutMutation: (options: unknown) => {
    deleteCalloutOptions(options);
    return [vi.fn()];
  },
}));

import { useCalloutManager } from './useCalloutManager';

describe('useCalloutManager', () => {
  it("leaves a refused visibility change or delete to the global error handler, which shows the server's reason", () => {
    renderHook(() => useCalloutManager());

    expect(updateVisibilityOptions.mock.calls[0][0]?.context).toBeUndefined();
    expect(deleteCalloutOptions.mock.calls[0][0]?.context).toBeUndefined();
  });
});
