import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ParsedMessage } from './matrixEvents';

const harness = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('@apollo/client', () => ({ useApolloClient: () => ({ query: harness.query }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({ RoomMessageAttachmentsDocument: {} }));

import { useMessageAttachments } from './useMessageAttachments';

const media = (index: number, mediaID?: string): ParsedMessage => ({
  eventId: `$${index}`,
  body: '',
  timestamp: index,
  sender: '@a:hs',
  reactions: [],
  media: { mediaID, displayName: `f${index}.png` },
});

describe('useMessageAttachments', () => {
  it('resolves own-homeserver media in calls of at most 100, keyed by event id', async () => {
    harness.query.mockImplementation(async ({ variables }) => ({
      data: {
        lookup: {
          conversation: {
            room: {
              messageAttachments: variables.media.map((item: { mediaID: string; displayName: string }) => ({
                id: `doc-${item.mediaID}`,
                url: `https://doc/${item.mediaID}`,
                displayName: item.displayName,
              })),
            },
          },
        },
      },
    }));
    const messages = [
      ...Array.from({ length: 150 }, (_, index) => media(index, `m${index}`)),
      media(999), // foreign or document-only media: never sent
    ];

    const { result } = renderHook(() => useMessageAttachments('conv-1', messages));

    await waitFor(() => expect(result.current.size).toBe(150));
    expect(harness.query.mock.calls.map(call => call[0].variables.media.length)).toEqual([100, 50]);
    expect(harness.query.mock.calls[0][0].variables.conversationId).toBe('conv-1');
    expect(result.current.get('$7')).toEqual(expect.objectContaining({ id: 'doc-m7', url: 'https://doc/m7' }));
    expect(result.current.has('$999')).toBe(false);
  });

  it('does not re-send media whose call is still in flight when the timeline grows', async () => {
    let answer: (() => void) | undefined;
    harness.query.mockReset();
    harness.query.mockImplementation(
      ({ variables }) =>
        new Promise(resolve => {
          answer = () =>
            resolve({
              data: {
                lookup: {
                  conversation: {
                    room: {
                      messageAttachments: variables.media.map((item: { mediaID: string }) => ({
                        displayName: item.mediaID,
                      })),
                    },
                  },
                },
              },
            });
        })
    );
    const { rerender } = renderHook(({ messages }) => useMessageAttachments('conv-2', messages), {
      initialProps: { messages: [media(1, 'm1')] },
    });
    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(1));

    rerender({ messages: [media(1, 'm1'), media(2, 'm2')] });
    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(2));

    expect(harness.query.mock.calls[1][0].variables.media.map((item: { mediaID: string }) => item.mediaID)).toEqual([
      'm2',
    ]);
    answer?.();
  });

  it('retries a failed batch when the conversation media changes, not on unrelated re-renders', async () => {
    let rejectCall: (reason: Error) => void = () => {};
    harness.query.mockReset();
    harness.query.mockImplementation(() => new Promise((_, reject) => (rejectCall = reject)));
    const first = [media(1, 'm1')];
    const { rerender } = renderHook(({ messages }) => useMessageAttachments('conv-3', messages), {
      initialProps: { messages: first },
    });
    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(1));
    await act(async () => rejectCall(new Error('boom')));

    rerender({ messages: first });
    rerender({ messages: [...first] });
    await act(async () => {});
    expect(harness.query).toHaveBeenCalledTimes(1);

    rerender({ messages: [media(1, 'm1'), media(2, 'm2')] });
    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(2));
  });
});
