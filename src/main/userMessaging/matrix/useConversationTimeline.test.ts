import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useConversationTimeline } from './useConversationTimeline';

const HS = 'hs.test';

// A room holding `total` text events, of which the newest `live` are loaded;
// scrollback loads older ones.
const makeClient = (total: number, live: number) => {
  const all = Array.from({ length: total }, (_, index) => ({
    getId: () => `$${index}`,
    getType: () => 'm.room.message',
    getSender: () => `@a:${HS}`,
    getTs: () => index,
    getOriginalContent: () => ({ msgtype: 'm.text', body: `m${index}` }),
  }));
  let loadedFrom = total - live;
  const room = { roomId: '!r', getLiveTimeline: () => ({ getEvents: () => all.slice(loadedFrom) }) };
  const scrollback = vi.fn(async (_room: unknown, limit: number) => {
    loadedFrom = Math.max(0, loadedFrom - limit);
  });
  const client = {
    getUserId: () => `@me:${HS}`,
    getRoomIdForAlias: vi.fn(async () => ({ room_id: '!r' })),
    getRoom: () => room,
    scrollback,
    on: vi.fn(),
    removeListener: vi.fn(),
  };
  return { client, scrollback };
};

describe('useConversationTimeline', () => {
  it('pages the opened conversation back to 1,000 events and stops there', async () => {
    const { client, scrollback } = makeClient(5000, 20);
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('alk-room'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(1000);
    expect(scrollback.mock.calls.reduce((sum, call) => sum + call[1], 0)).toBe(980);
  });

  it('stops at the start of a shorter room', async () => {
    const { client } = makeClient(130, 20);
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('alk-room'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(130);
  });

  it('does nothing without an opened conversation or without a Matrix session', () => {
    const { client, scrollback } = makeClient(10, 10);
    harness.client = client;
    const { result } = renderHook(() => useConversationTimeline(null));
    expect(result.current).toEqual({ messages: [], isLoading: false });
    expect(client.getRoomIdForAlias).not.toHaveBeenCalled();

    harness.client = null;
    const { result: noSession } = renderHook(() => useConversationTimeline('alk-room'));
    expect(noSession.current).toEqual({ messages: [], isLoading: false });
    expect(scrollback).not.toHaveBeenCalled();
  });
});
