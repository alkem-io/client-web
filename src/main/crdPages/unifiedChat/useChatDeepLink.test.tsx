import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnifiedConversation } from './dataMapper';
import { useChatDeepLinkOpen, useChatDeepLinkSelect } from './useChatDeepLink';

// ─── Mocks ────────────────────────────────────────────────────────────────

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));

// The location is driven directly rather than through MemoryRouter, because the
// latch regressions only reproduce when the URL changes WITHOUT remounting —
// remounting resets the ref and would make the test pass against the old code.
let mockPathname = '/';
let mockSearch = '';
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: () => ({ pathname: mockPathname, search: mockSearch, hash: '', state: null, key: 'test' }),
  };
});

const setIsOpenMock = vi.fn();
const setSelectedConversationIdMock = vi.fn();
const setSelectedRoomIdMock = vi.fn();
let mockContext: {
  isEnabled: boolean;
  setIsOpen: typeof setIsOpenMock;
  setSelectedConversationId: typeof setSelectedConversationIdMock;
  setSelectedRoomId: typeof setSelectedRoomIdMock;
};

vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => mockContext,
}));

/** Points the mocked location at `path` and returns a router wrapper for it. */
const wrapperAt = (path: string) => {
  const [pathname, search] = path.split('?');
  mockPathname = pathname || '/';
  mockSearch = search ? `?${search}` : '';
  return ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
};

const conversation = (overrides: Partial<UnifiedConversation> = {}): UnifiedConversation => ({
  id: 'conv-1',
  roomId: 'room-1',
  isGroup: false,
  unreadCount: 0,
  messagesCount: 0,
  createdDate: new Date(),
  members: [],
  isGuidance: false,
  pinned: false,
  ...overrides,
});

beforeEach(() => {
  navigateMock.mockClear();
  setIsOpenMock.mockClear();
  setSelectedConversationIdMock.mockClear();
  setSelectedRoomIdMock.mockClear();
  mockContext = {
    isEnabled: true,
    setIsOpen: setIsOpenMock,
    setSelectedConversationId: setSelectedConversationIdMock,
    setSelectedRoomId: setSelectedRoomIdMock,
  };
});

// ─── useChatDeepLinkOpen ────────────────────────────────────────────────────

describe('useChatDeepLinkOpen', () => {
  it('opens the panel when the URL carries ?chat=<id>', () => {
    renderHook(() => useChatDeepLinkOpen(), { wrapper: wrapperAt('/?chat=conv-1') });
    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });

  it('is a no-op when there is no chat param', () => {
    renderHook(() => useChatDeepLinkOpen(), { wrapper: wrapperAt('/') });
    expect(setIsOpenMock).not.toHaveBeenCalled();
  });

  it('does not open when messaging is not enabled', () => {
    mockContext.isEnabled = false;
    renderHook(() => useChatDeepLinkOpen(), { wrapper: wrapperAt('/?chat=conv-1') });
    expect(setIsOpenMock).not.toHaveBeenCalled();
  });

  // Regression: this hook's host (UnifiedChatLauncher) is mounted for the whole
  // session, so a boolean latch consumed only the FIRST deep link ever. Clicking
  // a second push notification navigates the SAME tab to /?chat=<other>, and the
  // panel never opened again.
  it('opens again for a different chat id within the same mount', () => {
    const { rerender } = renderHook(() => useChatDeepLinkOpen(), {
      wrapper: wrapperAt('/?chat=conv-1'),
    });
    expect(setIsOpenMock).toHaveBeenCalledTimes(1);

    // The param is stripped downstream once consumed, then the next push arrives.
    setIsOpenMock.mockClear();
    mockSearch = '';
    rerender();
    mockSearch = '?chat=conv-2';
    rerender();

    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });

  it('opens again for a REPEAT link to the same conversation', () => {
    const { rerender } = renderHook(() => useChatDeepLinkOpen(), {
      wrapper: wrapperAt('/?chat=conv-1'),
    });
    expect(setIsOpenMock).toHaveBeenCalledTimes(1);

    setIsOpenMock.mockClear();
    mockSearch = '';
    rerender();
    mockSearch = '?chat=conv-1';
    rerender();

    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });

  it('does not re-open while the same param is still on the URL', () => {
    const { rerender } = renderHook(() => useChatDeepLinkOpen(), {
      wrapper: wrapperAt('/?chat=conv-1'),
    });
    expect(setIsOpenMock).toHaveBeenCalledTimes(1);

    rerender();
    rerender();

    expect(setIsOpenMock).toHaveBeenCalledTimes(1);
  });
});

// ─── useChatDeepLinkSelect ──────────────────────────────────────────────────

describe('useChatDeepLinkSelect', () => {
  it('selects the matching conversation and strips the param on a known id', () => {
    const conversations = [conversation({ id: 'conv-1', roomId: 'room-1' }), conversation({ id: 'conv-2' })];
    renderHook(() => useChatDeepLinkSelect(conversations, false), { wrapper: wrapperAt('/?chat=conv-1') });

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('conv-1');
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith('room-1');
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('strips the param and falls back to the default list on an unknown id (no error UI)', () => {
    const conversations = [conversation({ id: 'conv-2' })];
    renderHook(() => useChatDeepLinkSelect(conversations, false), { wrapper: wrapperAt('/?chat=unknown-id') });

    expect(setSelectedConversationIdMock).not.toHaveBeenCalled();
    expect(setSelectedRoomIdMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('preserves sibling query params when stripping chat', () => {
    const conversations = [conversation({ id: 'conv-1', roomId: 'room-1' })];
    renderHook(() => useChatDeepLinkSelect(conversations, false), {
      wrapper: wrapperAt('/?foo=bar&chat=conv-1'),
    });

    expect(navigateMock).toHaveBeenCalledWith('/?foo=bar', { replace: true });
  });

  it('is a no-op when there is no chat param', () => {
    const conversations = [conversation({ id: 'conv-1' })];
    renderHook(() => useChatDeepLinkSelect(conversations, false), { wrapper: wrapperAt('/') });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(setSelectedConversationIdMock).not.toHaveBeenCalled();
  });

  it('waits for the conversation list to resolve before consuming the param', () => {
    const conversations: UnifiedConversation[] = [];
    renderHook(() => useChatDeepLinkSelect(conversations, true), { wrapper: wrapperAt('/?chat=conv-1') });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(setSelectedConversationIdMock).not.toHaveBeenCalled();
  });

  // Regression: while the panel stays open this hook stays mounted, so a boolean
  // latch meant the second push notification of a session selected nothing even
  // though the panel was already open.
  it('selects again for a different chat id within the same mount', () => {
    const conversations = [
      conversation({ id: 'conv-1', roomId: 'room-1' }),
      conversation({ id: 'conv-2', roomId: 'room-2' }),
    ];
    const { rerender } = renderHook(() => useChatDeepLinkSelect(conversations, false), {
      wrapper: wrapperAt('/?chat=conv-1'),
    });
    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('conv-1');

    // The hook strips the param itself; reflect that, then deliver the next link.
    setSelectedConversationIdMock.mockClear();
    setSelectedRoomIdMock.mockClear();
    mockSearch = '';
    rerender();
    mockSearch = '?chat=conv-2';
    rerender();

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('conv-2');
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith('room-2');
  });
});
