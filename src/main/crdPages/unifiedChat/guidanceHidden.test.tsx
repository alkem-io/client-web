import { act, renderHook } from '@testing-library/react';
import { createClient, EventType, MatrixEvent, Room } from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setActiveClient } from '@/core/matrix/activeClient';
import { useChatDeepLinkSelect } from './useChatDeepLink';
import { useUnifiedConversations } from './useUnifiedConversations';

const mocks = vi.hoisted(() => ({
  me: '11793d61-5d14-458a-b863-e17f39bb8da6',
  guidance: 'b29faa27-7272-4178-adff-8569b7c23301',
  search: '',
  navigate: vi.fn(),
  selectConversation: vi.fn(),
  selectRoom: vi.fn(),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: mocks.me } }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    isOpen: true,
    newlyCreatedConversationId: null,
    selectedRoomId: null,
    setSelectedConversationId: mocks.selectConversation,
    setSelectedRoomId: mocks.selectRoom,
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({
  useUnifiedChatContext: () => ({ guidanceVcId: mocks.guidance }),
}));
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', () => ({
  useConversationSummaries: () => undefined,
  displayedUnreadCount: (_summaries: unknown, roomId: string) => (roomId === directId ? 0 : 1),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => mocks.navigate }));
vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useLocation: () => ({ pathname: '/', search: mocks.search }),
}));

const directId = '183193a0-09c2-432b-8f7d-5878f22d7455';
const groupId = '7c38c3e8-3369-483e-9af2-07827e2648df';
const guidanceRoomId = '22194868-15ec-44f3-bbeb-0ec97631930d';
const peerId = '065c0830-c9a7-493c-b5b7-bbd65a7c2f3c';

const matrixId = (sigil: '@' | '!', id: string) => `${sigil}${id}:test.example`;

const renderListWithDeepLink = () =>
  renderHook(() => {
    const { conversations, isLoading, totalUnreadCount } = useUnifiedConversations();
    useChatDeepLinkSelect(conversations, isLoading);
    return { conversations, totalUnreadCount };
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = '';
  const me = matrixId('@', mocks.me);
  const client = createClient({ baseUrl: 'https://test.example', userId: me });
  for (const [id, peer] of [
    [directId, peerId],
    [groupId, mocks.guidance],
    [guidanceRoomId, mocks.guidance],
  ]) {
    const room = new Room(matrixId('!', id), client, me);
    room.currentState.setStateEvents(
      [me, matrixId('@', peer)].map(
        userId =>
          new MatrixEvent({
            type: EventType.RoomMember,
            room_id: room.roomId,
            state_key: userId,
            sender: userId,
            content: { membership: 'join' },
          })
      )
    );
    room.updateMyMembership('join');
    client.store.storeRoom(room);
  }
  client.store.storeAccountDataEvents([
    new MatrixEvent({
      type: EventType.Direct,
      content: {
        [matrixId('@', peerId)]: [matrixId('!', directId)],
        [matrixId('@', mocks.guidance)]: [matrixId('!', guidanceRoomId)],
      },
    }),
  ]);
  setActiveClient(client);
});

afterEach(() => act(() => setActiveClient(null)));

describe('the Guidance conversation remains hidden', () => {
  it('keeps a group with Guidance and excludes a direct Guidance room from the unread count', () => {
    const { result } = renderListWithDeepLink();

    expect(result.current.conversations.map(conversation => conversation.id).sort()).toEqual([directId, groupId]);
    expect(result.current.totalUnreadCount).toBe(1);
  });

  it('does not open a direct Guidance room from a deep link', () => {
    mocks.search = `?chat=${guidanceRoomId}`;
    renderListWithDeepLink();

    expect(mocks.selectConversation).not.toHaveBeenCalled();
    expect(mocks.selectRoom).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it.each([directId, groupId])('opens an accessible conversation from a deep link', id => {
    mocks.search = `?chat=${id}`;
    renderListWithDeepLink();

    expect(mocks.selectConversation).toHaveBeenCalledWith(id);
    expect(mocks.selectRoom).toHaveBeenCalledWith(id);
    expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
