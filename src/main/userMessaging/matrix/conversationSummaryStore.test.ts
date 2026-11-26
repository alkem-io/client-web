import type { MatrixClient } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { ConversationSummaryStore } from './conversationSummaryStore';

const HS = 'hs.test';
const ME = `@me:${HS}`;
const roomAId = '019435a6-8be3-7d28-a5f2-b05f03f76455';
const roomBId = '019435a6-8be3-7d28-a5f2-b05f03f76456';
const matrixRoom = (id: string) => `!${id}:${HS}`;

type FakeEvent = { eventId: string; type: string; sender: string; ts: number; content: Record<string, unknown> };

type FakeRoom = {
  roomId: string;
  events: FakeEvent[];
  /** Older history the server has but memory does not. */
  older?: FakeEvent[];
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
    const chunk = [...(room.older ?? []), ...room.events].reverse().map(event => ({
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
  it('summarizes each watched native room', async () => {
    const room: FakeRoom = { roomId: matrixRoom(roomAId), events: [text('$1', 'hello')], notifications: 3 };
    const { client } = makeClient([room]);
    const store = new ConversationSummaryStore(client);

    store.watch([roomAId]);
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)).toBeDefined());

    expect(store.getSnapshot().get(roomAId)).toEqual({
      lastMessage: expect.objectContaining({ body: 'hello' }),
      unreadCount: 3,
    });
    expect(store.alkemioRoomIdFor(matrixRoom(roomAId))).toBe(roomAId);
  });

  it('summarizes a watched room when sync first delivers it', async () => {
    const room: FakeRoom = { roomId: matrixRoom(roomAId), events: [text('$1', 'hello')], notifications: 0 };
    const rooms: FakeRoom[] = [];
    const { client, emit } = makeClient(rooms);
    const store = new ConversationSummaryStore(client);

    store.watch([roomAId]);
    await settle();
    expect(store.getSnapshot().get(roomAId)).toBeUndefined();

    rooms.push(room);
    emit('Room', { roomId: room.roomId });
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)?.lastMessage?.body).toBe('hello'));
  });

  it('recomputes only the room whose timeline changed', async () => {
    const roomA: FakeRoom = { roomId: matrixRoom(roomAId), events: [text('$a1', 'a')], notifications: 0 };
    const roomB: FakeRoom = { roomId: matrixRoom(roomBId), events: [text('$b1', 'b')], notifications: 0 };
    const { client, emit } = makeClient([roomA, roomB]);
    const store = new ConversationSummaryStore(client);
    store.watch([roomAId, roomBId]);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));
    const before = store.getSnapshot().get(roomBId);

    roomA.events.push(text('$a2', 'newer'));
    roomA.notifications = 1;
    emit('Room.timeline', {}, { roomId: matrixRoom(roomAId) }, false);
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)?.lastMessage?.body).toBe('newer'));

    expect(store.getSnapshot().get(roomBId)).toBe(before);
  });

  it('a change during a slow computation is recomputed afterwards, so the newest state wins', async () => {
    // The marker lies in history only the server holds, so every walk fetches.
    const room: FakeRoom = {
      roomId: matrixRoom(roomAId),
      events: [text('$1', 'first')],
      older: [text('$0', 'read')],
      marker: '$0',
      notifications: 0,
    };
    // The first walk is slow, the second fast: unguarded, the stale first result would land last.
    const { client, emit, createMessagesRequest } = makeClient([room], [60, 1]);
    const store = new ConversationSummaryStore(client);
    store.watch([roomAId]);
    // Let the first walk start, but not finish (vi.waitFor polls too slowly for this).
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(createMessagesRequest).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().get(roomAId)).toBeUndefined();

    // Arrives while the first walk is still in flight.
    room.events.push(text('$2', 'second'));
    emit('Room.timeline', {}, { roomId: matrixRoom(roomAId) }, false);

    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)?.unreadCount).toBe(2));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.getSnapshot().get(roomAId)).toEqual({
      lastMessage: expect.objectContaining({ body: 'second' }),
      unreadCount: 2,
    });
    expect(createMessagesRequest).toHaveBeenCalledTimes(2);
  });

  it('ignores rooms nobody watches, and a read-marker change recomputes the count', async () => {
    const room: FakeRoom = {
      roomId: matrixRoom(roomAId),
      events: [text('$1', 'x'), text('$2', 'y')],
      marker: '$1',
      notifications: 0,
    };
    const { client, emit } = makeClient([room]);
    const store = new ConversationSummaryStore(client);
    const unwatch = store.watch([roomAId]);
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)?.unreadCount).toBe(1));

    room.marker = '$2';
    emit('Room.accountData', { getType: () => 'm.fully_read' }, { roomId: matrixRoom(roomAId) });
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)?.unreadCount).toBe(0));

    unwatch();
    const snapshot = store.getSnapshot();
    room.events.push(text('$3', 'z'));
    emit('Room.timeline', {}, { roomId: matrixRoom(roomAId) }, false);
    await settle();
    expect(store.getSnapshot()).toBe(snapshot);
    expect(store.alkemioRoomIdFor(matrixRoom(roomAId))).toBeUndefined();
  });

  it('back-paginated events (toward the start) do not trigger a recompute', async () => {
    const room: FakeRoom = { roomId: matrixRoom(roomAId), events: [text('$1', 'x')], notifications: 0 };
    const { client, emit } = makeClient([room]);
    const store = new ConversationSummaryStore(client);
    store.watch([roomAId]);
    await vi.waitFor(() => expect(store.getSnapshot().get(roomAId)).toBeDefined());
    const snapshot = store.getSnapshot();

    emit('Room.timeline', {}, { roomId: matrixRoom(roomAId) }, true);
    await settle();

    expect(store.getSnapshot()).toBe(snapshot);
  });

  it('re-watching after a list change recomputes only rooms that are new or changed meanwhile', async () => {
    const roomA: FakeRoom = { roomId: matrixRoom(roomAId), events: [text('$a1', 'a')], notifications: 0 };
    const roomB: FakeRoom = { roomId: matrixRoom(roomBId), events: [text('$b1', 'b')], notifications: 0 };
    const { client, emit } = makeClient([roomA, roomB]);
    const store = new ConversationSummaryStore(client);
    const unwatch = store.watch([roomAId, roomBId]);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));
    const before = store.getSnapshot();

    unwatch();
    roomB.events.push(text('$b2', 'b while unwatched'));
    emit('Room.timeline', {}, { roomId: matrixRoom(roomBId) }, false);
    store.watch([roomAId, roomBId]);

    await vi.waitFor(() => expect(store.getSnapshot().get(roomBId)?.lastMessage?.body).toBe('b while unwatched'));
    expect(store.getSnapshot().get(roomAId)).toBe(before.get(roomAId));
  });
});
