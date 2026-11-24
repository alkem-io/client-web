import type { MatrixClient } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { ConversationSummaryStore } from './conversationSummaryStore';

const HS = 'hs.test';
const ME = `@me:${HS}`;

type FakeEvent = { eventId: string; type: string; sender: string; ts: number; content: Record<string, unknown> };

type FakeRoom = {
  roomId: string;
  events: FakeEvent[];
  /** Older history the server has but memory does not. */
  older?: FakeEvent[];
  marker?: string;
  notifications: number;
  tags?: Record<string, object>;
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
  const setRoomTag = vi.fn(async () => ({}));
  const deleteRoomTag = vi.fn(async () => ({}));
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
            get tags() {
              return room.tags ?? {};
            },
          }
        : null;
    },
    createMessagesRequest,
    setRoomTag,
    deleteRoomTag,
  };
  const emit = (name: string, ...args: unknown[]) => {
    for (const handler of handlers.get(name) ?? []) handler(...args);
  };
  return { client: client as unknown as MatrixClient, emit, createMessagesRequest, setRoomTag, deleteRoomTag };
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
      pinned: false,
    });
    expect(store.alkemioRoomIdFor('!alk-1')).toBe('alk-1');
  });

  it('looks a room up again on the first sync when its alias lookup failed before it', async () => {
    const room: FakeRoom = { roomId: '!alk-1', events: [text('$1', 'hello')], notifications: 0 };
    const { client, emit } = makeClient([room]);
    vi.mocked(client.getRoomIdForAlias).mockRejectedValueOnce(new Error('network'));
    const store = new ConversationSummaryStore(client);

    store.watch(['alk-1']);
    await settle();
    expect(store.getSnapshot().get('alk-1')).toBeUndefined();

    emit('sync', 'PREPARED');
    await vi.waitFor(() => expect(store.getSnapshot().get('alk-1')?.lastMessage?.body).toBe('hello'));
    expect(client.getRoomIdForAlias).toHaveBeenCalledTimes(2);
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
    // The marker lies in history only the server holds, so every walk fetches.
    const room: FakeRoom = {
      roomId: '!a',
      events: [text('$1', 'first')],
      older: [text('$0', 'read')],
      marker: '$0',
      notifications: 0,
    };
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

    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.unreadCount).toBe(2));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.getSnapshot().get('a')).toEqual({
      lastMessage: expect.objectContaining({ body: 'second' }),
      unreadCount: 2,
      pinned: false,
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

  it('re-watching after a list change recomputes only rooms that are new or changed meanwhile', async () => {
    const roomA: FakeRoom = { roomId: '!a', events: [text('$a1', 'a')], notifications: 0 };
    const roomB: FakeRoom = { roomId: '!b', events: [text('$b1', 'b')], notifications: 0 };
    const { client, emit } = makeClient([roomA, roomB]);
    const store = new ConversationSummaryStore(client);
    const unwatch = store.watch(['a', 'b']);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));
    const before = store.getSnapshot();

    unwatch();
    roomB.events.push(text('$b2', 'b while unwatched'));
    emit('Room.timeline', {}, { roomId: '!b' }, false);
    store.watch(['a', 'b']);

    await vi.waitFor(() => expect(store.getSnapshot().get('b')?.lastMessage?.body).toBe('b while unwatched'));
    expect(store.getSnapshot().get('a')).toBe(before.get('a'));
    expect(client.getRoomIdForAlias).toHaveBeenCalledTimes(2);
  });

  const pinnedRoom = async (tags: Record<string, object> = {}) => {
    const room: FakeRoom = { roomId: '!a', events: [text('$1', 'x')], notifications: 0, tags };
    const fake = makeClient([room]);
    const store = new ConversationSummaryStore(fake.client);
    store.watch(['a']);
    await vi.waitFor(() => expect(store.getSnapshot().get('a')).toBeDefined());
    return { room, store, ...fake };
  };
  const pinned = (store: ConversationSummaryStore) => store.getSnapshot().get('a')?.pinned;

  it("a tags change on sync updates the room's pin at once, without recomputing the room", async () => {
    const { room, store, emit, createMessagesRequest } = await pinnedRoom({ 'm.favourite': {} });
    expect(pinned(store)).toBe(true);
    const requests = createMessagesRequest.mock.calls.length;

    emit('Room.tags', {}, { roomId: '!a', tags: {} });
    room.tags = {};

    expect(pinned(store)).toBe(false);
    await settle();
    expect(createMessagesRequest).toHaveBeenCalledTimes(requests);
  });

  it('a later timeline change keeps the pin the tags gave', async () => {
    const { room, store, emit } = await pinnedRoom();
    emit('Room.tags', {}, { roomId: '!a', tags: { 'm.favourite': {} } });

    room.events = [...room.events, text('$2', 'y', undefined, 2)];
    emit('Room.timeline', {}, { roomId: '!a' }, false);

    await vi.waitFor(() => expect(store.getSnapshot().get('a')?.lastMessage?.body).toBe('y'));
    expect(pinned(store)).toBe(true);
  });

  it('togglePin pins at once and writes the favourite tag; unpin deletes it', async () => {
    const { store, setRoomTag, deleteRoomTag } = await pinnedRoom();

    const write = store.togglePin('a');
    expect(pinned(store)).toBe(true);
    await write;
    expect(setRoomTag).toHaveBeenCalledWith('!a', 'm.favourite');

    await store.togglePin('a');
    expect(pinned(store)).toBe(false);
    expect(deleteRoomTag).toHaveBeenCalledWith('!a', 'm.favourite');
  });

  it('togglePin takes the pin back and rejects when the homeserver refuses the write', async () => {
    const { store, setRoomTag } = await pinnedRoom();
    setRoomTag.mockRejectedValueOnce(new Error('M_FORBIDDEN'));

    await expect(store.togglePin('a')).rejects.toThrow('M_FORBIDDEN');

    expect(pinned(store)).toBe(false);
  });

  it('a failed unpin right after a pin, before sync echoes the tag, keeps the pin', async () => {
    const { store, deleteRoomTag } = await pinnedRoom();
    await store.togglePin('a');
    deleteRoomTag.mockRejectedValueOnce(new Error('M_LIMIT_EXCEEDED'));

    await expect(store.togglePin('a')).rejects.toThrow();

    expect(pinned(store)).toBe(true);
  });

  it('a failed write leaves the pin as tags that changed meanwhile give it', async () => {
    const { room, store, emit, setRoomTag } = await pinnedRoom();
    let fail: () => void = () => {};
    setRoomTag.mockReturnValueOnce(new Promise((_, reject) => (fail = () => reject(new Error('timeout')))));

    const write = store.togglePin('a');
    room.tags = { 'm.favourite': {} };
    emit('Room.tags', {}, { roomId: '!a', tags: room.tags });
    fail();
    await expect(write).rejects.toThrow();

    expect(pinned(store)).toBe(true);
  });

  it('togglePin ignores a second toggle while a write is in flight', async () => {
    const { store, setRoomTag, deleteRoomTag } = await pinnedRoom();
    let finish: () => void = () => {};
    setRoomTag.mockReturnValueOnce(new Promise(resolve => (finish = () => resolve({}))));

    const first = store.togglePin('a');
    await store.togglePin('a');

    expect(pinned(store)).toBe(true);
    expect(deleteRoomTag).not.toHaveBeenCalled();
    finish();
    await first;
  });

  it('togglePin rejects without writing for a room the client does not have', async () => {
    const { client, setRoomTag } = makeClient([]);
    const store = new ConversationSummaryStore(client);
    store.watch(['a']);
    await settle();

    await expect(store.togglePin('a')).rejects.toThrow();

    expect(setRoomTag).not.toHaveBeenCalled();
  });

  it('makes a missed call the preview and counts it unread only in a room where a ring is an entry', async () => {
    const ring = {
      eventId: '$ring',
      type: 'org.matrix.msc4075.rtc.notification',
      sender: `@other:${HS}`,
      ts: 2,
      content: { notification_type: 'ring', lifetime: 30_000 },
    };
    const room: FakeRoom = { roomId: '!alk-1', events: [text('$1', 'hello'), ring], marker: '$1', notifications: 0 };
    const { client } = makeClient([room]);
    const store = new ConversationSummaryStore(client);

    store.watch(['alk-1']);
    await vi.waitFor(() => expect(store.getSnapshot().get('alk-1')).toBeDefined());
    expect(store.getSnapshot().get('alk-1')).toMatchObject({ lastMessage: { body: 'hello' }, unreadCount: 0 });

    store.setRingRooms(new Set(['alk-1']));
    await vi.waitFor(() =>
      expect(store.getSnapshot().get('alk-1')).toMatchObject({
        lastMessage: { eventId: '$ring', call: { outcome: 'unanswered' } },
        unreadCount: 1,
      })
    );
  });

  it('makes a ring the preview and a missed call only once it stops ringing, though no further event arrives', async () => {
    const ring = {
      eventId: '$ring',
      type: 'org.matrix.msc4075.rtc.notification',
      sender: `@other:${HS}`,
      ts: Date.now(),
      content: { notification_type: 'ring', lifetime: 100 },
    };
    const room: FakeRoom = { roomId: '!alk-1', events: [text('$1', 'hello'), ring], marker: '$1', notifications: 0 };
    const { client } = makeClient([room]);
    const store = new ConversationSummaryStore(client);
    store.setRingRooms(new Set(['alk-1']));

    store.watch(['alk-1']);
    await vi.waitFor(() => expect(store.getSnapshot().get('alk-1')).toBeDefined());
    expect(store.getSnapshot().get('alk-1')).toMatchObject({ lastMessage: { body: 'hello' }, unreadCount: 0 });

    await vi.waitFor(() =>
      expect(store.getSnapshot().get('alk-1')).toMatchObject({
        lastMessage: { eventId: '$ring', call: { outcome: 'unanswered' } },
        unreadCount: 1,
      })
    );
  });
});
