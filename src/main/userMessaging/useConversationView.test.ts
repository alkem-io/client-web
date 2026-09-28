import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserConversation } from './models';
import type { ConversationMessage } from './useConversationMessages';
import { useConversationView } from './useConversationView';

// ---- Mocks ----

// One /read_markers call per mark: m.fully_read and m.read, both on the last message.
const readMarkersMock = vi.fn((_roomId: string, _fullyRead: string, _read?: string) => Promise.resolve({}));
const matrixClient = { setRoomReadMarkersHttpRequest: readMarkersMock };

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useLeaveConversationMutation: () => [vi.fn(() => Promise.resolve({})), { loading: false }],
  useSendMessageToRoomMutation: () => [vi.fn(() => Promise.resolve({})), { loading: false }],
}));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => matrixClient }));

vi.mock('./matrix/matrixRooms', () => ({
  resolveMatrixRoomId: (_client: unknown, alkemioRoomId: string) => Promise.resolve(`!matrix-${alkemioRoomId}`),
}));

// Marking resolves the Matrix room first; let that settle before asserting.
const flush = () => act(async () => {});

vi.mock('@/domain/communication/room/Comments/useCommentReactionsMutations', () => ({
  default: () => ({ addReaction: vi.fn(), removeReaction: vi.fn() }),
}));

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
