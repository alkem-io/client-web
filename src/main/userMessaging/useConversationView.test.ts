import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  getRoom: () => ({ getPendingEvents: () => pendingEvents }),
};
const session = vi.hoisted(() => ({ client: null as unknown }));
const sendMessageMutationMock = vi.fn((..._args: unknown[]) => Promise.resolve({}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useLeaveConversationMutation: () => [vi.fn(() => Promise.resolve({})), { loading: false }],
  useSendMessageToRoomMutation: () => [sendMessageMutationMock, { loading: false }],
}));

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

describe('useConversationView — writes go straight to Synapse (075)', () => {
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
