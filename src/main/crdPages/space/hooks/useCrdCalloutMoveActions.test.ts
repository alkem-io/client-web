import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const sortOrderOptions = vi.fn();
const updateSortOrder = vi.fn();
const notify = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateCalloutsSortOrderMutation: (options: unknown) => {
    sortOrderOptions(options);
    return [updateSortOrder, { loading: false }];
  },
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

import { useCrdCalloutMoveActions } from './useCrdCalloutMoveActions';

describe('useCrdCalloutMoveActions', () => {
  it("leaves a refused move to the global error handler, which shows the server's reason", async () => {
    updateSortOrder.mockRejectedValueOnce(new ApolloError({ graphQLErrors: [{ message: 'Refused' }] }));
    const { result } = renderHook(() =>
      useCrdCalloutMoveActions({ calloutsSetId: 'set-1', orderedCalloutIds: ['a', 'b'], calloutId: 'a' })
    );

    await act(async () => {
      await result.current.onMoveDown?.();
    });

    expect(sortOrderOptions.mock.calls[0][0]).toBeUndefined();
    expect(updateSortOrder).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();
  });
});
