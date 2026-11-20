import type { MatrixClient } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { sortUnifiedConversations, type UnifiedConversation } from '@/main/crdPages/unifiedChat/dataMapper';
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
});

describe('ConversationSummaryStore call entries', () => {
  const OTHER = `@other:${HS}`;
  const ring = (eventId: string, ts: number, sender = OTHER) => ({
    eventId,
    type: 'org.matrix.msc4075.rtc.notification',
    sender,
    ts,
    content: { notification_type: 'ring', lifetime: 30_000 },
  });
  const join = (eventId: string, ts: number, sender: string) => ({
    eventId,
    type: 'org.matrix.msc3401.call.member',
    sender,
    ts,
    content: { application: 'm.call', call_id: '', device_id: 'D' },
  });
  const conversation = (id: string, timestamp: number | undefined) =>
    ({
      id,
      roomId: id,
      isGroup: false,
      unreadCount: 0,
      createdDate: new Date(0),
      lastMessage: timestamp === undefined ? undefined : { id, message: '', timestamp, reactions: [], attachments: [] },
      members: [],
      isGuidance: false,
      pinned: false,
    }) satisfies UnifiedConversation;

  it('a ring newer than the last text message moves the conversation to the top of the list', async () => {
    const rung: FakeRoom = {
      roomId: '!rung',
      events: [text('$r1', 'old news', OTHER, 100), ring('$ring', 300)],
      notifications: 0,
    };
    const chatty: FakeRoom = { roomId: '!chatty', events: [text('$c1', 'newer text', OTHER, 200)], notifications: 0 };
    const { client, createMessagesRequest } = makeClient([rung, chatty]);
    const store = new ConversationSummaryStore(client);
    store.setWithCalls(true);
    store.watch(['rung', 'chatty']);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));

    const summaries = store.getSnapshot();
    expect(summaries.get('rung')?.lastMessage).toMatchObject({ eventId: '$ring', call: 'unanswered' });
    const sorted = sortUnifiedConversations(
      [
        conversation('chatty', summaries.get('chatty')?.lastMessage?.timestamp),
        conversation('rung', summaries.get('rung')?.lastMessage?.timestamp),
      ],
      null
    );
    expect(sorted.map(item => item.id)).toEqual(['rung', 'chatty']);
    // Found in memory: the ring adds no request.
    expect(createMessagesRequest).not.toHaveBeenCalled();
  });

  it('a ring found in fetched history is answered by a join the client holds in memory', async () => {
    const now = Date.now();
    const room: FakeRoom = {
      roomId: '!a',
      events: [join('$join', now - 55_000, ME)],
      older: [ring('$ring', now - 60_000)],
      notifications: 0,
    };
    const { client, createMessagesRequest } = makeClient([room]);
    // The server's page holds only the history memory lacks.
    createMessagesRequest.mockImplementation(async () => ({
      chunk: (room.older ?? []).map(event => ({
        event_id: event.eventId,
        type: event.type,
        sender: event.sender,
        origin_server_ts: event.ts,
        content: event.content,
      })),
    }));
    const store = new ConversationSummaryStore(client);
    store.setWithCalls(true);
    store.watch(['a']);
    await vi.waitFor(() => expect(store.getSnapshot().get('a')).toBeDefined());

    expect(store.getSnapshot().get('a')?.lastMessage).toMatchObject({ eventId: '$ring', call: 'answered' });
    expect(createMessagesRequest).toHaveBeenCalledTimes(1);
  });
  it('without calls shown a ring changes nothing, and showing calls moves the conversation up', async () => {
    const rung: FakeRoom = {
      roomId: '!rung',
      events: [text('$r1', 'old news', OTHER, 100), ring('$ring', 300)],
      notifications: 0,
    };
    const chatty: FakeRoom = { roomId: '!chatty', events: [text('$c1', 'newer text', OTHER, 200)], notifications: 0 };
    const { client } = makeClient([rung, chatty]);
    const store = new ConversationSummaryStore(client);
    store.watch(['rung', 'chatty']);
    await vi.waitFor(() => expect(store.getSnapshot().size).toBe(2));

    const order = () => {
      const summaries = store.getSnapshot();
      return sortUnifiedConversations(
        [
          conversation('rung', summaries.get('rung')?.lastMessage?.timestamp),
          conversation('chatty', summaries.get('chatty')?.lastMessage?.timestamp),
        ],
        null
      ).map(item => item.id);
    };
    expect(store.getSnapshot().get('rung')).toMatchObject({ lastMessage: { eventId: '$r1' }, unreadCount: 0 });
    expect(order()).toEqual(['chatty', 'rung']);

    store.setWithCalls(true);
    await vi.waitFor(() => expect(store.getSnapshot().get('rung')?.lastMessage?.eventId).toBe('$ring'));
    expect(order()).toEqual(['rung', 'chatty']);
  });
});
