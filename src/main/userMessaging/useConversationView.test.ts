import { act, renderHook, waitFor } from '@testing-library/react';
import { createClient, MatrixEvent, Room, RoomEvent } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { UserConversation } from './models';
import { useConversationView } from './useConversationView';

// ---- Mocks ----

// One /read_markers call per mark: m.fully_read and m.read, both on the same event.
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
  getUserId: () => '@me:hs',
  getDeviceId: () => 'device-1',
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
  nativeMatrixId: (alkemioRoomId: string) => `!matrix-${alkemioRoomId}`,
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
    renderHook(() => useConversationView(conversation, 'msg-1'));

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
    expect(readMarkersMock).toHaveBeenCalledWith('!matrix-room-1', 'msg-1', 'msg-1');
  });

  it('does NOT mark read while the tab is hidden', async () => {
    visibility = 'hidden';

    renderHook(() => useConversationView(conversation, 'msg-1'));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('does NOT mark read while the window is blurred, even though the tab is visible', async () => {
    focused = false;

    renderHook(() => useConversationView(conversation, 'msg-1'));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('does NOT mark a message that arrives while the user is away', async () => {
    const { rerender } = renderHook(({ readUpTo }) => useConversationView(conversation, readUpTo), {
      initialProps: { readUpTo: 'msg-1' },
    });
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    setActivity({ focused: false });
    readMarkersMock.mockClear();

    rerender({ readUpTo: 'msg-2' });

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });

  it('marks read exactly once on returning to an already-open thread with no new message', async () => {
    const { rerender } = renderHook(({ readUpTo }) => useConversationView(conversation, readUpTo), {
      initialProps: { readUpTo: 'msg-1' },
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
    rerender({ readUpTo: 'msg-1' });
    rerender({ readUpTo: 'msg-1' });

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
  });

  it('marks read on returning from a hidden tab too, not only from a blur', async () => {
    renderHook(() => useConversationView(conversation, 'msg-1'));
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    setActivity({ visibility: 'hidden' });
    readMarkersMock.mockClear();

    setActivity({ visibility: 'visible' });

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);
  });

  it('writes the marker again with the next client when the write failed', async () => {
    readMarkersMock.mockRejectedValueOnce(new Error('M_UNKNOWN_TOKEN'));
    const { rerender } = renderHook(() => useConversationView(conversation, 'msg-1'));
    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(1);

    // The session recovers with a fresh client; room, event and activity are unchanged.
    session.client = { ...matrixClient };
    rerender();

    await flush();
    expect(readMarkersMock).toHaveBeenCalledTimes(2);
    expect(readMarkersMock).toHaveBeenLastCalledWith('!matrix-room-1', 'msg-1', 'msg-1');
  });

  it('does not mark read with no conversation or no message', async () => {
    renderHook(() => useConversationView(null, null));
    renderHook(() => useConversationView(conversation, null));

    await flush();
    expect(readMarkersMock).not.toHaveBeenCalled();
  });
});

const dm = (counterpartType: ActorType | null): UserConversation => ({
  ...conversation,
  members: [
    { id: 'me', type: ActorType.User, displayName: 'Me' },
    ...(counterpartType ? [{ id: 'other', type: counterpartType, displayName: 'Other' }] : []),
  ],
});
describe('useConversationView — plain Matrix replies', () => {
  it('lets the Matrix verdict authorize the plain rich reply and reuses the transaction on retry', async () => {
    const makeTxn = vi.spyOn(matrixClient, 'makeTxnId').mockReturnValueOnce('reply-1').mockReturnValue('reply-2');
    sendEventMock.mockRejectedValueOnce({ errcode: 'M_FORBIDDEN' });
    const { result } = renderHook(() => useConversationView(dm(ActorType.User), null));

    await act(async () => {
      expect(await result.current.handleSendMessage('  reply  ', undefined, '$target')).toBe(false);
      expect(await result.current.handleSendMessage('reply', undefined, '$target')).toBe(true);
      expect(await result.current.handleSendMessage('reply', undefined, '$target')).toBe(true);
    });

    const content = { msgtype: 'm.text', body: 'reply', 'm.relates_to': { 'm.in_reply_to': { event_id: '$target' } } };
    expect(sendEventMock.mock.calls).toEqual([
      ['!matrix-room-1', 'm.room.message', content, 'reply-1'],
      ['!matrix-room-1', 'm.room.message', content, 'reply-1'],
      ['!matrix-room-1', 'm.room.message', content, 'reply-2'],
    ]);
    expect(makeTxn).toHaveBeenCalledTimes(2);
    expect(actorDetailsMock).not.toHaveBeenCalled();
    expect(sendMessageMutationMock).not.toHaveBeenCalled();
  });

  it('allocates a different transaction when the reply target changes', async () => {
    vi.spyOn(matrixClient, 'makeTxnId').mockReturnValueOnce('reply-1').mockReturnValue('reply-2');
    sendEventMock.mockRejectedValueOnce(new Error('connection lost'));
    const { result } = renderHook(() => useConversationView(conversation, null));

    await act(async () => {
      expect(await result.current.handleSendMessage('reply', undefined, '$first')).toBe(false);
      expect(await result.current.handleSendMessage('reply', undefined, '$second')).toBe(true);
    });

    expect(sendEventMock.mock.calls.map(args => args[3])).toEqual(['reply-1', 'reply-2']);
  });
});

describe('useConversationView — writes go straight to Synapse', () => {
  it('a text-only send makes a direct call and no sendMessageToRoom call', async () => {
    const { result } = renderHook(() => useConversationView(conversation, null));

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

  it('an uploaded reference goes to the existing destination-checked send without another byte upload', async () => {
    const { result } = renderHook(() => useConversationView(conversation, null));

    await act(async () => {
      await result.current.handleSendMessage('', { externalReference: 'media-1', displayName: 'photo.png' });
    });

    expect(sendMessageMutationMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMutationMock).toHaveBeenCalledWith({
      variables: {
        messageData: {
          roomID: 'room-1',
          message: '',
          attachmentUpload: { externalReference: 'media-1', displayName: 'photo.png' },
        },
      },
    });
    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it('resolves only after Synapse accepts the event, and keeps isSending true meanwhile', async () => {
    let accept: (value: { event_id: string }) => void = () => {};
    sendEventMock.mockImplementationOnce(() => new Promise(resolve => (accept = resolve)));
    const { result } = renderHook(() => useConversationView(conversation, null));

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

  it('discards the hidden failed echo when the user changes the text', async () => {
    const echo = { getTxnId: () => 'txn-1', status: 'not_sent' };
    vi.spyOn(matrixClient, 'makeTxnId').mockReturnValueOnce('txn-1').mockReturnValue('txn-2');
    sendEventMock.mockImplementationOnce(() => {
      pendingEvents.push(echo);
      return Promise.reject(new Error('M_FORBIDDEN'));
    });
    const { result } = renderHook(() => useConversationView(conversation, null));

    let sent: boolean | undefined;
    await act(async () => {
      sent = await result.current.handleSendMessage('hello');
    });

    expect(sent).toBe(false);
    expect(cancelPendingEventMock).not.toHaveBeenCalled();
    await act(async () => {
      expect(await result.current.handleSendMessage('changed')).toBe(true);
    });
    expect(cancelPendingEventMock).toHaveBeenCalledWith(echo);
  });

  it('react sends an m.reaction annotation and unreact redacts the reaction event, with no mutation', async () => {
    const { result } = renderHook(() => useConversationView(conversation, null));

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

  const realClient = (requests: string[] = []) => {
    const client = createClient({
      baseUrl: 'http://synapse.test',
      userId: USER_ID,
      accessToken: 'token',
      fetchFn: ((input: RequestInfo | URL) =>
        new Promise<Response>(resolve => {
          requests.push(String(input));
          respond = (status, body) =>
            resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
        })) as typeof fetch,
    });
    const room = new Room(MATRIX_ROOM_ID, client, USER_ID);
    client.store.storeRoom(room);
    return { client, room };
  };

  it('retries a Matrix-refused reply through the same real SDK event and transaction', async () => {
    const requests: string[] = [];
    const { client, room } = realClient(requests);
    session.client = client;
    const { result } = renderHook(() => useConversationView(dm(ActorType.User), null));

    let outcome: Promise<boolean | undefined> = Promise.resolve(undefined);
    await act(async () => {
      outcome = result.current.handleSendMessage('hello', undefined, '$target');
    });
    await vi.waitFor(() => expect(room.getLiveTimeline().getEvents()).toHaveLength(1));
    const echo = room.getLiveTimeline().getEvents()[0];
    expect(echo.status).toBe('sending');
    expect(echo.getType()).toBe('m.room.message');
    expect(echo.getContent().body).toBe('hello');
    expect(echo.getContent()['m.relates_to']).toEqual({ 'm.in_reply_to': { event_id: '$target' } });

    await act(async () => {
      respond(403, { errcode: 'M_FORBIDDEN', error: 'no' });
      await outcome;
    });

    expect(await outcome).toBe(false);
    expect(actorDetailsMock).not.toHaveBeenCalled();
    expect(echo.status).toBe('not_sent');

    await act(async () => {
      outcome = result.current.handleSendMessage('hello', undefined, '$target');
    });
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[0]).toBe(requests[1]);
    expect(room.getLiveTimeline().getEvents()).toEqual([echo]);

    await act(async () => {
      respond(200, { event_id: '$server' });
      expect(await outcome).toBe(true);
    });
    expect(echo.getId()).toBe('$server');
  });

  it('the remote echo swaps the local echo in place and emits Room.localEchoUpdated, not Room.timeline', async () => {
    const { client, room } = realClient();
    session.client = client;
    const { result } = renderHook(() => useConversationView(conversation, null));

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

  // Another tab or device of the same user can add the same reaction before this
  // view has synced it; Synapse then refuses the duplicate. The reaction the user
  // asked for exists, so the add has succeeded from their point of view.
  const reactionEchoes = (room: Room) =>
    room
      .getLiveTimeline()
      .getEvents()
      .filter(e => e.getType() === 'm.reaction');

  it('an add refused as a duplicate annotation resolves and leaves no local echo behind', async () => {
    const { client, room } = realClient();
    session.client = client;
    const { result } = renderHook(() => useConversationView(conversation, null));

    let added: Promise<unknown> | undefined;
    await act(async () => {
      added = result.current.handleAddReaction('$msg')('👍');
    });
    await vi.waitFor(() => expect(reactionEchoes(room)).toHaveLength(1));

    await act(async () => {
      respond(400, { errcode: 'M_DUPLICATE_ANNOTATION', error: "Can't send same reaction twice" });
      await expect(added).resolves.toBeUndefined();
    });
    expect(reactionEchoes(room)).toHaveLength(0);
  });

  it('any other refusal of an add still rejects', async () => {
    const { client } = realClient();
    session.client = client;
    const { result } = renderHook(() => useConversationView(conversation, null));

    let added: Promise<unknown> | undefined;
    await act(async () => {
      added = result.current.handleAddReaction('$msg')('👍');
    });
    await act(async () => {
      respond(403, { errcode: 'M_FORBIDDEN', error: 'no' });
      await expect(added).rejects.toMatchObject({ errcode: 'M_FORBIDDEN' });
    });
  });
});
