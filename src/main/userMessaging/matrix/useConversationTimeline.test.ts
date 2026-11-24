import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown, establishing: false, callsShown: false }));

vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () => harness.client,
  useMatrixSessionEstablishing: () => harness.establishing,
}));

vi.mock('../calls/useCallEligibility', () => ({ useCallsShown: () => harness.callsShown }));

import { computeUnreadCount } from './unreadCount';
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

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(1000);
    expect(scrollback.mock.calls.reduce((sum, call) => sum + call[1], 0)).toBe(980);
  });

  it('stops at the start of a shorter room', async () => {
    const { client } = makeClient(130, 20);
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(130);
  });

  it('keeps the history already loaded when a backfill page fails', async () => {
    const { client, scrollback } = makeClient(5000, 20);
    scrollback.mockRejectedValueOnce(new Error('M_LIMIT_EXCEEDED'));
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(20);
  });

  it('renders nothing for a room that has no Matrix room behind it', async () => {
    const { client, scrollback } = makeClient(10, 10);
    client.getRoomIdForAlias.mockRejectedValue(new Error('M_NOT_FOUND'));
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('unlisted-room', false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([]);
    expect(scrollback).not.toHaveBeenCalled();
  });

  it('looks the room up again on the first sync when the lookup failed before it', async () => {
    const { client } = makeClient(30, 30);
    client.getRoomIdForAlias.mockRejectedValueOnce(new Error('network'));
    harness.client = client;

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([]);

    const onSync = client.on.mock.calls.find(([name]) => name === 'sync')?.[1] as (state: string) => void;
    act(() => onSync('PREPARED'));

    await waitFor(() => expect(result.current.messages).toHaveLength(30));
    expect(client.getRoomIdForAlias).toHaveBeenCalledTimes(2);
  });

  it('puts the read marker past a newest message that is not rendered, so it counts as read', async () => {
    const event = (id: string, type: string, content: Record<string, unknown>) => ({
      getId: () => id,
      getType: () => type,
      getSender: () => `@a:${HS}`,
      getTs: () => 0,
      getOriginalContent: () => content,
    });
    const events = [
      event('$text', 'm.room.message', { msgtype: 'm.text', body: 'hello' }),
      // Redacted, or sent blank by a member writing to Synapse directly.
      event('$blank', 'm.room.message', {}),
      event('$reaction', 'm.reaction', { 'm.relates_to': { rel_type: 'm.annotation', event_id: '$text', key: '👍' } }),
    ];
    const { client } = makeClient(0, 0);
    harness.client = {
      ...client,
      getRoom: () => ({ roomId: '!r', getLiveTimeline: () => ({ getEvents: () => events }) }),
    };

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages.map(message => message.eventId)).toEqual(['$text']);
    expect(result.current.readUpToEventId).toBe('$blank');

    const unreadFrom = (markerEventId: string) =>
      computeUnreadCount({
        markerEventId,
        ownUserId: `@me:${HS}`,
        loadedNewestFirst: [...events].reverse().map(e => ({
          eventId: e.getId(),
          type: e.getType(),
          sender: e.getSender(),
          timestamp: e.getTs(),
          content: e.getOriginalContent(),
        })),
        fetchBatch: async () => ({ events: [] }),
        notificationCount: () => 99,
      });
    expect(await unreadFrom(result.current.readUpToEventId as string)).toBe(0);
    // Marking only the last rendered message would leave the blank one unread for good.
    expect(await unreadFrom('$text')).toBe(1);
  });

  it('makes a ring an entry in a 1:1 conversation only, never in a group where any member could send one', async () => {
    const ring = {
      getId: () => '$ring',
      getType: () => 'org.matrix.msc4075.rtc.notification',
      getSender: () => `@a:${HS}`,
      getTs: () => 0,
      getOriginalContent: () => ({ notification_type: 'ring', lifetime: 1 }),
    };
    const { client } = makeClient(0, 0);
    harness.client = {
      ...client,
      getRoom: () => ({ roomId: '!r', getLiveTimeline: () => ({ getEvents: () => [ring] }) }),
    };
    harness.callsShown = true;

    const direct = renderHook(() => useConversationTimeline('alk-room', false));
    await waitFor(() => expect(direct.result.current.isLoading).toBe(false));
    expect(direct.result.current.messages.map(message => message.eventId)).toEqual(['$ring']);

    const group = renderHook(() => useConversationTimeline('alk-room', true));
    await waitFor(() => expect(group.result.current.isLoading).toBe(false));
    expect(group.result.current.messages).toEqual([]);
    expect(group.result.current.readUpToEventId).toBeNull();
    harness.callsShown = false;
  });

  it('shows a ring once it stops ringing, though no further event arrives', async () => {
    const rungAt = Date.now();
    const ring = {
      getId: () => '$ring',
      getType: () => 'org.matrix.msc4075.rtc.notification',
      getSender: () => `@a:${HS}`,
      getTs: () => rungAt,
      getOriginalContent: () => ({ notification_type: 'ring', lifetime: 100 }),
    };
    const { client } = makeClient(0, 0);
    harness.client = {
      ...client,
      getRoom: () => ({ roomId: '!r', getLiveTimeline: () => ({ getEvents: () => [ring] }) }),
    };
    harness.callsShown = true;

    const { result } = renderHook(() => useConversationTimeline('alk-room', false));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([]);
    expect(result.current.readUpToEventId).toBeNull();

    await waitFor(() => expect(result.current.messages.map(message => message.call?.outcome)).toEqual(['unanswered']));
    expect(result.current.readUpToEventId).toBe('$ring');
    harness.callsShown = false;
  });

  it('shows or hides ring entries in place when calls start or stop showing, without loading again', async () => {
    const ring = {
      getId: () => '$ring',
      getType: () => 'org.matrix.msc4075.rtc.notification',
      getSender: () => `@a:${HS}`,
      getTs: () => 0,
      getOriginalContent: () => ({ notification_type: 'ring', lifetime: 1 }),
    };
    const { client } = makeClient(0, 0);
    harness.client = {
      ...client,
      getRoom: () => ({ roomId: '!r', getLiveTimeline: () => ({ getEvents: () => [ring] }) }),
    };

    const { result, rerender } = renderHook(() => useConversationTimeline('alk-room', false));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([]);
    const subscriptions = client.on.mock.calls.length;

    harness.callsShown = true;
    rerender();
    expect(result.current.messages.map(message => message.eventId)).toEqual(['$ring']);
    expect(result.current.isLoading).toBe(false);
    expect(client.on.mock.calls.length).toBe(subscriptions);
    harness.callsShown = false;
  });

  it('does nothing without an opened conversation or without a Matrix session', () => {
    const { client, scrollback } = makeClient(10, 10);
    harness.client = client;
    const { result } = renderHook(() => useConversationTimeline(null, false));
    expect(result.current).toEqual({ messages: [], readUpToEventId: null, isLoading: false });
    expect(client.getRoomIdForAlias).not.toHaveBeenCalled();

    harness.client = null;
    harness.establishing = false;
    const { result: noSession } = renderHook(() => useConversationTimeline('alk-room', false));
    expect(noSession.current).toEqual({ messages: [], readUpToEventId: null, isLoading: false });
    expect(scrollback).not.toHaveBeenCalled();
  });

  it('shows loading while the Matrix session is being established, and the empty state once it is not', () => {
    harness.client = null;
    harness.establishing = true;
    const { result, rerender } = renderHook(() => useConversationTimeline('alk-room', false));
    expect(result.current).toEqual({ messages: [], readUpToEventId: null, isLoading: true });

    harness.establishing = false;
    rerender();
    expect(result.current).toEqual({ messages: [], readUpToEventId: null, isLoading: false });
  });

  it('shows no loading without an opened conversation even while establishing', () => {
    harness.client = null;
    harness.establishing = true;
    const { result } = renderHook(() => useConversationTimeline(null, false));
    expect(result.current).toEqual({ messages: [], readUpToEventId: null, isLoading: false });
    harness.establishing = false;
  });
});
