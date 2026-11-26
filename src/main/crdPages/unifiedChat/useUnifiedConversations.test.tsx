import { act, renderHook } from '@testing-library/react';
import { ClientEvent, createClient, EventType, MatrixEvent, Room } from 'matrix-js-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { setActiveClient, setSessionEstablishing } from '@/core/matrix/activeClient';
import { useUnreadConversationsCount } from '@/main/userMessaging/useUnreadConversationsCount';
import { useUnifiedConversations } from './useUnifiedConversations';

const mocks = vi.hoisted(() => ({
  me: 'a40dcc42-d33c-435b-878d-d2524f63c222',
  selectedRoomId: null as string | null,
  summaries: new Map<string, { unreadCount: number; lastMessage?: unknown }>(),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: mocks.me } }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    isOpen: true,
    newlyCreatedConversationId: null,
    selectedRoomId: mocks.selectedRoomId,
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: null }) }));
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', async importOriginal => ({
  ...(await importOriginal<typeof import('@/main/userMessaging/matrix/conversationSummaryStore')>()),
  useConversationSummaries: () => mocks.summaries,
}));

const me = `@${mocks.me}:test.example`;
const peer = '6f8a6edc-1b3f-4b02-80f2-6cd416e5a428';
const matrixPeer = `@${peer}:test.example`;
const directId = 'e72ccb1f-a775-4558-beed-8c9065c02e56';
const groupId = 'ac7bab56-b8be-4632-b0bd-9f9bb2d502b3';
const pendingId = '9d2eaab3-94e1-4254-8e07-9b24bbdc494b';
const at = Date.parse('2026-01-01T00:00:00Z');

const makeClient = () => createClient({ baseUrl: 'https://test.example', userId: me });
type Client = ReturnType<typeof makeClient>;

const storeRoom = (client: Client, id: string, membership: string, name?: string, host = 'test.example') => {
  const room = new Room(`!${id}:${host}`, client, me);
  const members = [
    [me, 'Me'],
    [matrixPeer, 'Morgan'],
  ].map(
    ([userId, displayName]) =>
      new MatrixEvent({
        type: EventType.RoomMember,
        room_id: room.roomId,
        state_key: userId,
        sender: userId,
        origin_server_ts: at,
        content: { membership: userId === me ? membership : 'join', displayname: displayName },
      })
  );
  room.currentState.setStateEvents(
    name
      ? [
          ...members,
          new MatrixEvent({ type: EventType.RoomName, room_id: room.roomId, state_key: '', content: { name } }),
        ]
      : members
  );
  room.updateMyMembership(membership);
  room.recalculate();
  client.store.storeRoom(room);
  return room;
};

afterEach(() => {
  act(() => {
    setActiveClient(null);
    setSessionEstablishing(false);
  });
  mocks.selectedRoomId = null;
  mocks.summaries.clear();
});

describe('useUnifiedConversations', () => {
  it('waits for the platform Matrix sync instead of listing legacy GraphQL rooms', () => {
    setSessionEstablishing(true);
    const { result } = renderHook(useUnifiedConversations);

    expect(result.current).toMatchObject({ conversations: [], totalUnreadCount: 0, isLoading: true });

    act(() => setSessionEstablishing(false));
    expect(result.current.isLoading).toBe(false);
  });

  it('lists joined native rooms and updates direct identity, previews and badges from sync', () => {
    const client = makeClient();
    const direct = storeRoom(client, directId, 'join');
    storeRoom(client, groupId, 'join', 'Project group');
    storeRoom(client, pendingId, 'invite');
    storeRoom(client, '7f9ca40e-53db-4934-8408-717dfd44917e', 'join', 'Remote', 'remote.example');
    setActiveClient(client);
    mocks.summaries.set(directId, {
      unreadCount: 3,
      lastMessage: { eventId: '$last', sender: matrixPeer, body: 'Latest message', timestamp: at + 1, reactions: [] },
    });
    mocks.summaries.set(groupId, { unreadCount: 1 });
    mocks.summaries.set(pendingId, { unreadCount: 9 });

    const { result, rerender } = renderHook(() => ({
      list: useUnifiedConversations(),
      badge: useUnreadConversationsCount(),
    }));

    expect(result.current.list.conversations.map(room => room.id)).toEqual([directId, groupId]);
    expect(result.current.list.conversations[0].isGroup).toBe(true);
    expect(result.current.badge).toBe(2);

    act(() => {
      const event = new MatrixEvent({ type: EventType.Direct, content: { [matrixPeer]: [direct.roomId] } });
      client.store.storeAccountDataEvents([event]);
      client.emit(ClientEvent.AccountData, event);
    });

    expect(result.current.list.conversations).toMatchObject([
      {
        id: directId,
        roomId: directId,
        displayName: 'Morgan',
        isGroup: false,
        unreadCount: 3,
        createdDate: new Date(at),
        members: [
          { id: mocks.me, type: ActorType.User, displayName: 'Me' },
          { id: peer, type: undefined, displayName: 'Morgan' },
        ],
        lastMessage: { id: '$last', message: 'Latest message', sender: { id: peer, displayName: 'Morgan' } },
      },
      { id: groupId, roomId: groupId, isGroup: true, displayName: 'Project group', roomDisplayName: 'Project group' },
    ]);
    expect(result.current.list.totalUnreadCount).toBe(2);

    mocks.selectedRoomId = directId;
    rerender();
    expect(result.current.list.totalUnreadCount).toBe(1);
    expect(result.current.badge).toBe(1);
  });
});
