import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType, RoomType } from '@/core/apollo/generated/graphql-schema';

/**
 * Guards the TEMP hide of the Guidance assistant: it must be absent from the
 * conversation list and unreachable through the `?chat=` deep link, while direct
 * and group chats keep working. Delete this file together with the filter in
 * `useUnifiedConversations` when guidance comes back.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  /** Raw GraphQL conversations the query returns. */
  conversations: [] as unknown[],
  guidanceVcId: null as string | null,
  /** Room ids Matrix sync reports as having unread messages. */
  unreadRoomIds: [] as string[],
}));

const navigateMock = vi.fn();
const setSelectedConversationIdMock = vi.fn();
const setSelectedRoomIdMock = vi.fn();

// The location is driven directly rather than through MemoryRouter, matching
// useChatDeepLink.test.tsx — `useNavigate` is mocked, so no router is needed.
let mockSearch = '';

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsQuery: () => ({
    loading: false,
    error: undefined,
    data: { me: { conversations: { conversations: mocks.conversations } } },
  }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    isOpen: true,
    newlyCreatedConversationId: null,
    selectedRoomId: null,
    setSelectedConversationId: setSelectedConversationIdMock,
    setSelectedRoomId: setSelectedRoomIdMock,
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({
  useUnifiedChatContext: () => ({ guidanceVcId: mocks.guidanceVcId }),
}));
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', () => ({
  // No Matrix client in the test, so there are no summaries — only the unread
  // count, which is what the badge arithmetic is asserted on.
  useConversationSummaries: () => undefined,
  displayedUnreadCount: (_summaries: unknown, roomId: string) => (mocks.unreadRoomIds.includes(roomId) ? 1 : 0),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: () => ({ pathname: '/', search: mockSearch, hash: '', state: null, key: 'test' }),
  };
});

import { useChatDeepLinkSelect } from './useChatDeepLink';
import { useUnifiedConversations } from './useUnifiedConversations';

// ─── Fixtures ─────────────────────────────────────────────────────────────

const GUIDANCE_VC_ID = 'guidance-vc';

const user = (id: string, displayName: string) => ({
  id,
  type: ActorType.User,
  profile: { displayName, url: `/u/${id}`, avatar: { uri: `${id}.png` } },
});

const guidanceVc = () => ({
  id: GUIDANCE_VC_ID,
  type: ActorType.VirtualContributor,
  profile: { displayName: 'Guidance', url: '/vc/guidance', avatar: { uri: 'guidance.png' } },
});

const conversation = (id: string, roomId: string, type: RoomType, members: unknown[]) => ({
  id,
  room: { id: roomId, type, displayName: `conversation-${id}`, avatarUrl: null, createdDate: '2026-01-01' },
  members,
});

const directConversation = conversation('conv-direct', 'room-direct', RoomType.ConversationDirect, [
  user('me', 'Me'),
  user('other', 'Other'),
]);
const groupConversation = conversation('conv-group', 'room-group', RoomType.ConversationGroup, [
  user('me', 'Me'),
  user('a', 'A'),
  user('b', 'B'),
]);
const guidanceConversation = conversation('conv-guidance', 'room-guidance', RoomType.ConversationDirect, [
  user('me', 'Me'),
  guidanceVc(),
]);

/** Composes the two hooks exactly as UnifiedChatPanelConnector does. */
const renderListWithDeepLink = () =>
  renderHook(() => {
    const { conversations, isLoading, totalUnreadCount } = useUnifiedConversations();
    useChatDeepLinkSelect(conversations, isLoading);
    return { conversations, totalUnreadCount };
  });

beforeEach(() => {
  navigateMock.mockClear();
  setSelectedConversationIdMock.mockClear();
  setSelectedRoomIdMock.mockClear();
  mockSearch = '';
  mocks.conversations = [directConversation, groupConversation, guidanceConversation];
  mocks.guidanceVcId = GUIDANCE_VC_ID;
  mocks.unreadRoomIds = [];
});

// ─── The conversation list ────────────────────────────────────────────────

describe('the guidance conversation is hidden from the list', () => {
  it('drops the guidance row while direct and group chats stay', () => {
    const { result } = renderListWithDeepLink();

    const ids = result.current.conversations.map(conv => conv.id);
    expect(ids).toHaveLength(2);
    expect(ids).toContain('conv-direct');
    expect(ids).toContain('conv-group');
    expect(ids).not.toContain('conv-guidance');
    // No row is flagged as guidance, so nothing downstream can render the pin,
    // the beta badge, the intro message or the info/clear buttons.
    expect(result.current.conversations.some(conv => conv.isGuidance)).toBe(false);
    expect(result.current.conversations.some(conv => conv.pinned)).toBe(false);
  });

  it('keeps a multi-member group that merely includes the guidance assistant', () => {
    mocks.conversations = [
      conversation('conv-group-vc', 'room-group-vc', RoomType.ConversationGroup, [
        user('me', 'Me'),
        user('a', 'A'),
        guidanceVc(),
      ]),
    ];

    const { result } = renderListWithDeepLink();

    expect(result.current.conversations.map(conv => conv.id)).toEqual(['conv-group-vc']);
  });

  it('leaves the guidance conversation out of the unread conversation count', () => {
    mocks.unreadRoomIds = ['room-guidance', 'room-direct'];

    const { result } = renderListWithDeepLink();

    expect(result.current.totalUnreadCount).toBe(1);
    expect(result.current.conversations.filter(conv => conv.unreadCount > 0).map(conv => conv.id)).toEqual([
      'conv-direct',
    ]);
  });
});

// ─── The ?chat= deep link ─────────────────────────────────────────────────

describe('the ?chat= deep link cannot open the guidance conversation', () => {
  it('selects nothing and strips the param for the guidance conversation id', () => {
    mockSearch = '?chat=conv-guidance';

    renderListWithDeepLink();

    expect(setSelectedConversationIdMock).not.toHaveBeenCalled();
    expect(setSelectedRoomIdMock).not.toHaveBeenCalled();
    // Same degradation as any unknown/inaccessible id: param gone, default list, no error UI.
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('still opens a direct conversation from a deep link', () => {
    mockSearch = '?chat=conv-direct';

    renderListWithDeepLink();

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('conv-direct');
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith('room-direct');
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('still opens a group conversation from a deep link', () => {
    mockSearch = '?chat=conv-group';

    renderListWithDeepLink();

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('conv-group');
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith('room-group');
  });
});
