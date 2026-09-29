import { act, renderHook } from '@testing-library/react';
import { createClient, MatrixEvent, Room, RoomEvent } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { UserConversation } from './models';
import type { ConversationMessage } from './useConversationMessages';
import { useConversationView } from './useConversationView';

// ---- Mocks ----

// One /read_markers call per mark: m.fully_read and m.read, both on the last message.
const readMarkersMock = vi.fn((_roomId: string, _fullyRead: string, _read?: string) => Promise.resolve({}));
const sendEventMock = vi.fn((..._args: unknown[]) => Promise.resolve({ event_id: '$sent' }));
const redactEventMock = vi.fn((..._args: unknown[]) => Promise.resolve({ event_id: '$redaction' }));
const cancelPendingEventMock = vi.fn();
const pendingEvents: { getTxnId: () => string; status: string }[] = [];
const matrixClient = {
  setRoomReadMarkersHttpRequest: readMarkersMock,
  sendEvent: sendEventMock,
  redactEvent: redactEventMock,
  cancelPendingEvent: cancelPendingEventMock,
  makeTxnId: () => 'txn-1',
  getRoom: () => ({ getLiveTimeline: () => ({ getEvents: () => pendingEvents }) }),
};
const session = vi.hoisted(() => ({ client: null as unknown }));
const sendMessageMutationMock = vi.fn((..._args: unknown[]) => Promise.resolve({}));

const actorDetailsMock = vi.fn((..._args: unknown[]): Promise<unknown> => Promise.resolve({ data: { actor: null } }));
const notifyMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useLeaveConversationMutation: () => [vi.fn(() => Promise.resolve({})), { loading: false }],
  useSendMessageToRoomMutation: () => [sendMessageMutationMock, { loading: false }],
  useActorDetailsLazyQuery: () => [actorDetailsMock],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => session.client }));

vi.mock('./matrix/matrixRooms', () => ({
  resolveMatrixRoomId: (_client: unknown, alkemioRoomId: string) => Promise.resolve(`!matrix-${alkemioRoomId}`),
}));

// Marking resolves the Matrix room first; let that settle before asserting.
const flush = () => act(async () => {});

// ---- Document activity harness ----

let visibility: DocumentVisibilityState = 'visible';
let focused = true;

const setActivity = (next: { visibility?: DocumentVisibilityState; focused?: boolean }) => {
  if (next.visibility !== undefined) visibility = next.visibility;
  if (next.focused !== undefined) focused = next.focused;

  act(() => {
    // A real browser fires `visibilitychange` on the document and `focus`/`blur`
    // on the window; firing both keeps the harness agnostic about which one the
    // hook listens to for a given transition.
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event(focused ? 'focus' : 'blur'));
  });
};

const conversation: UserConversation = {
  id: 'conv-1',
  roomId: 'room-1',
  isGroup: false,
  unreadCount: 0,
  createdDate: new Date(0),
  members: [],
};

const message = (id: string): ConversationMessage => ({
  id,
  message: `body of ${id}`,
  timestamp: 1,
  reactions: [],
  attachments: [],
});

beforeEach(() => {
  visibility = 'visible';
  focused = true;
  readMarkersMock.mockClear();
  sendEventMock.mockClear();
  redactEventMock.mockClear();
  cancelPendingEventMock.mockClear();
  sendMessageMutationMock.mockClear();
  actorDetailsMock.mockReset();
  actorDetailsMock.mockResolvedValue({ data: { actor: null } });
  notifyMock.mockClear();
  pendingEvents.length = 0;
  session.client = matrixClient;

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibility,
  });
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focused);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * FR-018b / D-23. The server cancels a pending message digest when the
 * recipient's unread count is zero, so a read receipt from an open-but-
 * unattended tab silently suppresses notifications the user should have had.
 */
describe('useConversationView — read receipts are gated on real presence (FR-018b)', () => {
  it('marks read when the document is visible AND focused', async () => {
    renderHook(() => useConversationView(conversation, [message('msg-1')]));

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
    expect(readMarkersMock).toHaveBeenCalledWith('!matrix-room-1', 'msg-1', 'msg-1');
  });

  it('does NOT mark read while the tab is hidden', async () => {
    visibility = 'hidden';

    renderHook(() => useConversationView(conversation, [message('msg-1')]));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('does NOT mark read while the window is blurred, even though the tab is visible', async () => {
    focused = false;

    renderHook(() => useConversationView(conversation, [message('msg-1')]));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('does NOT mark a message that arrives while the user is away', async () => {
    const { rerender } = renderHook(({ messages }) => useConversationView(conversation, messages), {
      initialProps: { messages: [message('msg-1')] },
    });
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    setActivity({ focused: false });
    readMarkersMock.mockClear();

    rerender({ messages: [message('msg-1'), message('msg-2')] });

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('marks read exactly once on returning to an already-open thread with no new message', async () => {
    const { rerender } = renderHook(({ messages }) => useConversationView(conversation, messages), {
      initialProps: { messages: [message('msg-1')] },
    });
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    setActivity({ focused: false });
    readMarkersMock.mockClear();

    setActivity({ focused: true });

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
    expect(readMarkersMock).toHaveBeenCalledWith('!matrix-room-1', 'msg-1', 'msg-1');

    // Re-renders after the return must not re-fire — the ref key blocks it.
    rerender({ messages: [message('msg-1')] });
    rerender({ messages: [message('msg-1')] });

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
  });

  it('marks read on returning from a hidden tab too, not only from a blur', async () => {
    renderHook(() => useConversationView(conversation, [message('msg-1')]));
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    setActivity({ visibility: 'hidden' });
    readMarkersMock.mockClear();

    setActivity({ visibility: 'visible' });

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
  });

  it('does not mark read with no conversation or no messages', async () => {
    renderHook(() => useConversationView(null, []));
    renderHook(() => useConversationView(conversation, []));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });
});

describe('useConversationView — DM consent is checked per text send', () => {
  const dm = (counterpartType: ActorType | null): UserConversation => ({
    ...conversation,
    members: [
      { id: 'me', type: ActorType.User, displayName: 'Me' },
      ...(counterpartType ? [{ id: 'other', type: counterpartType, displayName: 'Other' }] : []),
    ],
  });
  const contactable = (isContactable: boolean) => ({ data: { actor: { __typename: 'User', isContactable } } });
  const send = async (target: UserConversation, text = 'hello', attachments?: string[]) => {
    const { result } = renderHook(() => useConversationView(target, []));
    let sent: boolean | undefined;
    await act(async () => {
      sent = await result.current.handleSendMessage(text, attachments);
    });
    return sent;
  };

  it('blocks a send to a non-contactable user, notifies, and resolves false', async () => {
    actorDetailsMock.mockResolvedValue(contactable(false));

    expect(await send(dm(ActorType.User))).toBe(false);
    expect(sendEventMock).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.MESSAGING_NOT_ENABLED', 'error');
  });

  it('sends to a contactable user', async () => {
    actorDetailsMock.mockResolvedValue(contactable(true));

    expect(await send(dm(ActorType.User))).toBe(true);
    expect(sendEventMock).toHaveBeenCalledTimes(1);
  });

  it('looks up on every send, network-only, so withdrawn consent blocks the next one', async () => {
    actorDetailsMock.mockResolvedValueOnce(contactable(true)).mockResolvedValueOnce(contactable(false));
    const { result } = renderHook(() => useConversationView(dm(ActorType.User), []));

    let first: boolean | undefined;
    let second: boolean | undefined;
    await act(async () => {
      first = await result.current.handleSendMessage('one');
      second = await result.current.handleSendMessage('two');
    });

    expect([first, second]).toEqual([true, false]);
    expect(actorDetailsMock).toHaveBeenCalledTimes(2);
    expect(actorDetailsMock).toHaveBeenCalledWith({ variables: { actorId: 'other' }, fetchPolicy: 'network-only' });
    expect(sendEventMock).toHaveBeenCalledTimes(1);
  });

  it('starts no send before a delayed lookup resolves, and isSending is true meanwhile', async () => {
    let resolveLookup: (value: unknown) => void = () => {};
    actorDetailsMock.mockImplementationOnce(() => new Promise(resolve => (resolveLookup = resolve)));
    const { result } = renderHook(() => useConversationView(dm(ActorType.User), []));

    let sendPromise: Promise<boolean | undefined> = Promise.resolve(undefined);
    await act(async () => {
      sendPromise = result.current.handleSendMessage('hello');
    });
    expect(sendEventMock).not.toHaveBeenCalled();
    expect(result.current.isSending).toBe(true);

    await act(async () => {
      resolveLookup(contactable(true));
      await sendPromise;
    });
    expect(sendEventMock).toHaveBeenCalledTimes(1);
  });

  it('a failed lookup makes no send and resolves false', async () => {
    actorDetailsMock.mockResolvedValue({ error: new Error('boom') });

    expect(await send(dm(ActorType.User))).toBe(false);
    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it('a null actor proceeds', async () => {
    expect(await send(dm(ActorType.User))).toBe(true);
    expect(sendEventMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a virtual-contributor counterpart', dm(ActorType.VirtualContributor)],
    ['no other member', dm(null)],
    ['a group', { ...dm(ActorType.User), isGroup: true }],
  ])('%s sends without a lookup', async (_name, target) => {
    expect(await send(target)).toBe(true);
    expect(actorDetailsMock).not.toHaveBeenCalled();
    expect(sendEventMock).toHaveBeenCalledTimes(1);
  });

  it('an attachment send in a DM with a user goes through sendMessageToRoom with no lookup', async () => {
    await send(dm(ActorType.User), 'hello', ['doc-1']);

    expect(actorDetailsMock).not.toHaveBeenCalled();
    expect(sendMessageMutationMock).toHaveBeenCalledTimes(1);
    expect(sendEventMock).not.toHaveBeenCalled();
  });
});

describe('useConversationView — writes go straight to Synapse', () => {
  it('a text-only send makes a direct call and no sendMessageToRoom call', async () => {
    const { result } = renderHook(() => useConversationView(conversation, []));

    let sent: boolean | undefined;
    await act(async () => {
      sent = await result.current.handleSendMessage('  hello  ');
    });

    expect(sent).toBe(true);
    expect(sendEventMock).toHaveBeenCalledWith(
      '!matrix-room-1',
      'm.room.message',
      { msgtype: 'm.text', body: 'hello' },
      'txn-1'
    );
    expect(sendMessageMutationMock).not.toHaveBeenCalled();
  });

  it('a send with attachments calls sendMessageToRoom and makes no direct call', async () => {
    const { result } = renderHook(() => useConversationView(conversation, []));

    await act(async () => {
      await result.current.handleSendMessage('hello', ['doc-1']);
    });

    expect(sendMessageMutationMock).toHaveBeenCalledTimes(1);
    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it('resolves only after Synapse accepts the event, and keeps isSending true meanwhile', async () => {
    let accept: (value: { event_id: string }) => void = () => {};
    sendEventMock.mockImplementationOnce(() => new Promise(resolve => (accept = resolve)));
    const { result } = renderHook(() => useConversationView(conversation, []));

    let settled = false;
    let sendPromise: Promise<boolean | undefined> = Promise.resolve(undefined);
    await act(async () => {
      sendPromise = result.current.handleSendMessage('hello').then(value => {
        settled = true;
        return value;
      });
    });
    expect(settled).toBe(false);
    expect(result.current.isSending).toBe(true);

    await act(async () => {
      accept({ event_id: '$sent' });
      await sendPromise;
    });
    expect(settled).toBe(true);
    expect(result.current.isSending).toBe(false);
  });

  it('a rejected direct send resolves false and cancels the local echo', async () => {
    sendEventMock.mockImplementationOnce(() => Promise.reject(new Error('M_FORBIDDEN')));
    const echo = { getTxnId: () => 'txn-1', status: 'not_sent' };
    pendingEvents.push(echo);
    const { result } = renderHook(() => useConversationView(conversation, []));

    let sent: boolean | undefined;
    await act(async () => {
      sent = await result.current.handleSendMessage('hello');
    });

    expect(sent).toBe(false);
    expect(cancelPendingEventMock).toHaveBeenCalledWith(echo);
  });

  it('react sends an m.reaction annotation and unreact redacts the reaction event, with no mutation', async () => {
    const { result } = renderHook(() => useConversationView(conversation, []));

    await act(async () => {
      await result.current.handleAddReaction('$msg')('👍');
      await result.current.handleRemoveReaction('$reaction');
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      '!matrix-room-1',
      'm.reaction',
      { 'm.relates_to': { rel_type: 'm.annotation', event_id: '$msg', key: '👍' } },
      'txn-1'
    );
    expect(redactEventMock).toHaveBeenCalledWith('!matrix-room-1', '$reaction', 'txn-1');
    expect(sendMessageMutationMock).not.toHaveBeenCalled();
  });
});

// A real matrix-js-sdk Room (default chronological pending-event ordering, as the
// session client uses) and a real client whose HTTP layer is a delayed fake.
describe('useConversationView — local echoes on a real matrix-js-sdk Room', () => {
  const MATRIX_ROOM_ID = '!matrix-room-1';
  const USER_ID = '@me:hs';
  let respond: (status: number, body: object) => void = () => {};

  const realClient = () => {
    const client = createClient({
      baseUrl: 'http://synapse.test',
      userId: USER_ID,
      accessToken: 'token',
      fetchFn: (() =>
        new Promise<Response>(resolve => {
          respond = (status, body) =>
            resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
        })) as typeof fetch,
    });
    const room = new Room(MATRIX_ROOM_ID, client, USER_ID);
    client.store.storeRoom(room);
    return { client, room };
  };

  it('a rejected send cancels the NOT_SENT echo, leaves the live timeline empty and rethrows the original error', async () => {
    const { client, room } = realClient();
    session.client = client;
    const { result } = renderHook(() => useConversationView(conversation, []));

    let outcome: Promise<unknown> = Promise.resolve();
    await act(async () => {
      outcome =
        result.current
          .handleAddReaction('$msg')('👍')
          ?.catch((error: unknown) => error) ?? Promise.resolve();
    });
    await vi.waitFor(() => expect(room.getLiveTimeline().getEvents()).toHaveLength(1));
    expect(room.getLiveTimeline().getEvents()[0].status).toBe('sending');

    await act(async () => {
      respond(403, { errcode: 'M_FORBIDDEN', error: 'no' });
      await outcome;
    });

    expect(await outcome).toMatchObject({ errcode: 'M_FORBIDDEN' });
    expect(room.getLiveTimeline().getEvents()).toHaveLength(0);
  });

  it('the remote echo swaps the local echo in place and emits Room.localEchoUpdated, not Room.timeline', async () => {
    const { client, room } = realClient();
    session.client = client;
    const { result } = renderHook(() => useConversationView(conversation, []));

    let sent: Promise<boolean | undefined> = Promise.resolve(undefined);
    await act(async () => {
      sent = result.current.handleSendMessage('hello');
    });
    await vi.waitFor(() => expect(room.getLiveTimeline().getEvents()).toHaveLength(1));
    const echo = room.getLiveTimeline().getEvents()[0];
    expect(echo.status).toBe('sending');

    const localEchoUpdated = vi.fn();
    const timeline = vi.fn();
    room.on(RoomEvent.LocalEchoUpdated, localEchoUpdated);
    room.on(RoomEvent.Timeline, timeline);

    const remote = new MatrixEvent({
      event_id: '$server',
      type: 'm.room.message',
      sender: USER_ID,
      room_id: MATRIX_ROOM_ID,
      origin_server_ts: 1,
      content: { msgtype: 'm.text', body: 'hello' },
      unsigned: { transaction_id: echo.getTxnId() },
    });
    await act(async () => {
      await room.addLiveEvents([remote], { addToState: false });
    });

    expect(localEchoUpdated).toHaveBeenCalledTimes(1);
    expect(timeline).not.toHaveBeenCalled();
    expect(room.getLiveTimeline().getEvents()).toHaveLength(1);
    expect(room.getLiveTimeline().getEvents()[0].getId()).toBe('$server');
    expect(room.getLiveTimeline().getEvents()[0].status).toBeNull();

    await act(async () => {
      respond(200, { event_id: '$server' });
      expect(await sent).toBe(true);
    });
  });
});
