import type { MatrixClient } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { ConversationSummaryStore } from './conversationSummaryStore';

const HS = 'hs.test';
const ME = `@me:${HS}`;

type FakeRoom = {
  roomId: string;
  events: { eventId: string; type: string; sender: string; ts: number; content: Record<string, unknown> }[];
  marker?: string;
  notifications: number;
};

// Each /messages call answers with the room as it was when the call was made,
// after that call's delay (the next delay in `delaysMs`, else 0).
const makeClient = (rooms: FakeRoom[], delaysMs: number[] = []) => {
  const handlers = new Map<string, ((...args: unknown[]) => void)[]>();
  let call = 0;
  const createMessagesRequest = vi.fn(async (roomId: string) => {
    const room = rooms.find(candidate => candidate.roomId === roomId) as FakeRoom;
    const chunk = [...room.events].reverse().map(event => ({
      event_id: event.eventId,
      type: event.type,
      sender: event.sender,
      origin_server_ts: event.ts,
      content: event.content,
    }));
    await new Promise(resolve => setTimeout(resolve, delaysMs[call++] ?? 0));
    return { chunk };
  });
  const client = {
    getUserId: () => ME,
    on: (name: string, handler: (...args: unknown[]) => void) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    },
    getRoomIdForAlias: vi.fn(async (alias: string) => ({ room_id: `!${alias.slice(1, alias.indexOf(':'))}` })),
    getRoom: (roomId: string) => {
      const room = rooms.find(candidate => candidate.roomId === roomId);
      return room
        ? {
            roomId,
            getLiveTimeline: () => ({
              getEvents: () =>
                room.events.map(event => ({
                  getId: () => event.eventId,
                  getType: () => event.type,
                  getSender: () => event.sender,
                  getTs: () => event.ts,
                  getOriginalContent: () => event.content,
                })),
            }),
            getAccountData: () => (room.marker ? { getContent: () => ({ event_id: room.marker }) } : undefined),
            getUnreadNotificationCount: () => room.notifications,
          }
        : null;
    },
    createMessagesRequest,
  };
  const emit = (name: string, ...args: unknown[]) => {
    for (const handler of handlers.get(name) ?? []) handler(...args);
  };
  return { client: client as unknown as MatrixClient, emit, createMessagesRequest };
};

const text = (eventId: string, body: string, sender = `@other:${HS}`, ts = 1) => ({
  eventId,
  type: 'm.room.message',
  sender,
  ts,
  content: { msgtype: 'm.text', body },
});

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('ConversationSummaryStore', () => {
  it('resolves each watched conversation by its alias and summarizes it', async () => {
    const room: FakeRoom = { roomId: '!alk-1', events: [text('$1', 'hello')], notifications: 3 };
    const { client } = makeClient([room]);
    const store = new ConversationSummaryStore(client);

    store.watch(['alk-1']);
    await vi.waitFor(() => expect(store.getSnapshot().get('alk-1')).toBeDefined());

    expect(client.getRoomIdForAlias).toHaveBeenCalledWith(`#alk-1:${HS}`);
    expect(store.getSnapshot().get('alk-1')).toEqual({
      lastMessage: expect.objectContaining({ body: 'hello' }),
      unreadCount: 3,
    });
    expect(store.alkemioRoomIdFor('!alk-1')).toBe('alk-1');
  });

  it('recomputes only the room whose timeline changed', async () => {
    const roomA: FakeRoom = { roomId: '!a', events: [text('$a1', 'a')], notifications: 0 };
    const roomB: FakeRoom = { roomId: '!b', events: [text('$b1', 'b')], notifications: 0 };
    const { client, emit } = makeClient([roomA, roomB]);
    const store = new ConversationSummaryStore(client);
    store.watch(['a', 'b']);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));
    const before = store.getSnapshot().get('b');

    roomA.events.push(text('$a2', 'newer'));
    roomA.notifications = 1;
    emit('Room.timeline', {}, { roomId: '!a' }, false);
    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.lastMessage?.body).toBe('newer'));

    expect(store.getSnapshot().get('b')).toBe(before);
  });

  it('a change during a slow computation is recomputed afterwards, so the newest state wins', async () => {
    const room: FakeRoom = { roomId: '!a', events: [text('$1', 'first')], marker: '$1', notifications: 0 };
    // The first walk is slow, the second fast: unguarded, the stale first result would land last.
    const { client, emit, createMessagesRequest } = makeClient([room], [60, 1]);
    const store = new ConversationSummaryStore(client);
    store.watch(['a']);
    // Let the first walk start, but not finish (vi.waitFor polls too slowly for this).
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(createMessagesRequest).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().get('a')).toBeUndefined();

    // Arrives while the first walk is still in flight.
    room.events.push(text('$2', 'second'));
    emit('Room.timeline', {}, { roomId: '!a' }, false);

    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.unreadCount).toBe(1));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.getSnapshot().get('a')).toEqual({
      lastMessage: expect.objectContaining({ body: 'second' }),
      unreadCount: 1,
    });
    expect(createMessagesRequest).toHaveBeenCalledTimes(2);
  });

  it('ignores rooms nobody watches, and a read-marker change recomputes the count', async () => {
    const room: FakeRoom = { roomId: '!a', events: [text('$1', 'x'), text('$2', 'y')], marker: '$1', notifications: 0 };
    const { client, emit } = makeClient([room]);
    const store = new ConversationSummaryStore(client);
    const unwatch = store.watch(['a']);
    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.unreadCount).toBe(1));

    room.marker = '$2';
    emit('Room.accountData', { getType: () => 'm.fully_read' }, { roomId: '!a' });
    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.unreadCount).toBe(0));

    unwatch();
    const snapshot = store.getSnapshot();
    room.events.push(text('$3', 'z'));
    emit('Room.timeline', {}, { roomId: '!a' }, false);
    await settle();
    expect(store.getSnapshot()).toBe(snapshot);
    expect(store.alkemioRoomIdFor('!a')).toBeUndefined();
  });

  it('back-paginated events (toward the start) do not trigger a recompute', async () => {
    const room: FakeRoom = { roomId: '!a', events: [text('$1', 'x')], notifications: 0 };
    const { client, emit } = makeClient([room]);
    const store = new ConversationSummaryStore(client);
    store.watch(['a']);
    await vi.waitFor(() => expect(store.getSnapshot().get('a')).toBeDefined());
    const snapshot = store.getSnapshot();

    emit('Room.timeline', {}, { roomId: '!a' }, true);
    await settle();

    expect(store.getSnapshot()).toBe(snapshot);
  });
});
