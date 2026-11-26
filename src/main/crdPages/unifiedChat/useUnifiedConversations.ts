import type { EventType, MatrixClient } from 'matrix-js-sdk';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { useMatrixSessionEstablishing } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { displayedUnreadCount, useConversationSummaries } from '@/main/userMessaging/matrix/conversationSummaryStore';
import { nativeEntityId } from '@/main/userMessaging/matrix/matrixRooms';
import { toConversationMessage } from '@/main/userMessaging/matrix/toConversationMessage';
import type { ConversationMember } from '@/main/userMessaging/models';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useNativeConversationRooms } from '@/main/userMessaging/useUnreadConversationsCount';
import { sortUnifiedConversations, type UnifiedConversation } from './dataMapper';
import { useUnifiedChatContext } from './UnifiedChatProvider';

const directPeers = (client: MatrixClient): Map<string, string> => {
  const peers = new Map<string, string>();
  const content = client.getAccountData('m.direct' as EventType.Direct)?.getContent() ?? {};
  for (const [matrixPeerId, roomIds] of Object.entries(content)) {
    const peerId = nativeEntityId(matrixPeerId, '@', client);
    if (peerId && Array.isArray(roomIds)) {
      for (const roomId of roomIds) {
        if (typeof roomId === 'string') {
          peers.set(roomId, peerId);
        }
      }
    }
  }
  return peers;
};

export const useUnifiedConversations = () => {
  const { isEnabled, isOpen, newlyCreatedConversationId, selectedRoomId } = useUserMessagingContext();
  const { guidanceVcId } = useUnifiedChatContext();
  const { userModel: currentUser } = useCurrentUserContext();
  const { client, rooms } = useNativeConversationRooms(isEnabled);
  const establishing = useMatrixSessionEstablishing();
  const summaries = useConversationSummaries(rooms.map(({ id }) => id));
  const peers = client ? directPeers(client) : new Map<string, string>();

  const conversations = sortUnifiedConversations(
    client
      ? rooms.flatMap(({ id, room }): UnifiedConversation[] => {
          const directPeerId = peers.get(room.roomId);
          // The Guidance assistant is hidden while virtual contributors are off.
          if (guidanceVcId && directPeerId === guidanceVcId) return [];

          const members = room.getJoinedMembers().flatMap((member): ConversationMember[] => {
            const memberId = nativeEntityId(member.userId, '@', client);
            if (!memberId) return [];
            const mxc = member.getMxcAvatarUrl();
            return [
              {
                id: memberId,
                type:
                  memberId === currentUser?.id
                    ? ActorType.User
                    : memberId === guidanceVcId
                      ? ActorType.VirtualContributor
                      : undefined,
                displayName: member.rawDisplayName || member.name,
                avatarUri: mxc ? (client.mxcUrlToHttp(mxc) ?? undefined) : undefined,
              },
            ];
          });

          const peer = members.find(member => member.id === directPeerId);
          const isGroup = directPeerId === undefined;
          const name = room.currentState.getStateEvents('m.room.name', '')?.getContent().name;
          const roomDisplayName = isGroup && typeof name === 'string' && name ? name : undefined;
          const roomAvatar = room.getMxcAvatarUrl();
          const avatarUri = isGroup
            ? roomAvatar
              ? (client.mxcUrlToHttp(roomAvatar) ?? undefined)
              : undefined
            : peer?.avatarUri;
          const summary = summaries?.get(id);
          const self = client.getUserId();
          const createdAt =
            room.currentState.getStateEvents('m.room.create', '')?.getTs() ||
            (self ? room.getMember(self)?.events.member?.getTs() : undefined) ||
            room.getLastLiveEvent()?.getTs() ||
            0;

          return [
            {
              id,
              roomId: id,
              isGroup,
              displayName: peer?.displayName || roomDisplayName || room.name,
              roomDisplayName,
              avatarUri,
              unreadCount: displayedUnreadCount(summaries, id, selectedRoomId),
              createdDate: new Date(createdAt),
              lastMessage: summary?.lastMessage
                ? toConversationMessage(summary.lastMessage, { members, otherProfiles: new Map() })
                : undefined,
              members,
              isGuidance: false,
              pinned: false,
            },
          ];
        })
      : [],
    newlyCreatedConversationId
  );

  return {
    conversations,
    // The badge counts conversations with unread messages.
    totalUnreadCount: conversations.filter(conversation => conversation.unreadCount > 0).length,
    isLoading: isEnabled && isOpen && establishing,
    error: client?.getSyncStateData()?.error,
  };
};
