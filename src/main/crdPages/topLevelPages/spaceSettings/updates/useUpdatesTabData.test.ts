import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { sendMessage } = vi.hoisted(() => ({ sendMessage: vi.fn((_options: unknown) => Promise.resolve({})) }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchCommunityUpdatesQuery: () => ({}),
  useCommunityUpdatesQuery: () => ({
    data: { lookup: { community: { communication: { updates: { id: 'room-1', messages: [] } } } } },
    loading: false,
  }),
  useSendMessageToRoomMutation: () => [sendMessage, { loading: false }],
  useRemoveMessageOnRoomMutation: () => [vi.fn(), { loading: false }],
}));

import { useUpdatesTabData } from './useUpdatesTabData';

describe('useUpdatesTabData', () => {
  it('passes the caller context to the send, so a caller that shows its own failure skips the global error handler', async () => {
    const { result } = renderHook(() => useUpdatesTabData('community-1'));
    act(() => result.current.onDraftChange('Hello members'));

    await act(async () => {
      await result.current.onSubmit({ skipGlobalErrorHandler: true });
    });

    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ context: { skipGlobalErrorHandler: true } }));
  });
});
