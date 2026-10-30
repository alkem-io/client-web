import { useEffect, useState } from 'react';
import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoomType } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isGuidanceConversation } from '@/main/crdPages/unifiedChat/dataMapper';
import { useGuidanceVcId } from '@/main/guidance/chatWidget/useGuidanceVcId';
import { useUserMessagingContext } from '../UserMessagingContext';
import { isCallsConfigured } from './callConfig';
import { type IncomingCallRooms, setIncomingCallRooms } from './incomingCallStore';
import { useActiveCallRooms } from './useActiveCallRooms';
import { type CallableConversation, isBetaTester } from './useCallEligibility';

// Kept off the startup path, like the unread count.
const DELAY_MS = 2000;

/**
 * Watches every callable conversation of the user, with the chat panel closed
 * too, for calls the user is not in, and publishes them for the unread signals.
 * The sound for a call starting comes from its notification event (useSyncChatSound).
 */
export const useIncomingCallsWatcher = () => {
  const { isEnabled } = useUserMessagingContext();
  const { platformRoles, userModel } = useCurrentUserContext();
  const enabled = isEnabled && isBetaTester(platformRoles) && isCallsConfigured();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setReady(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  // The chat panel's own queries, loaded here even while it is closed: the room type, member types
  // and the guidance assistant's id tell which conversations take calls.
  const { data } = useUserConversationsQuery({ skip: !enabled || !ready, fetchPolicy: 'cache-first' });
  const { guidanceVcId } = useGuidanceVcId({ skip: !enabled || !ready });
  const userConversations = data?.me?.conversations?.conversations ?? [];
  const conversations: CallableConversation[] = userConversations.flatMap(conv =>
    conv.room
      ? [
          {
            roomId: conv.room.id,
            isGroup: conv.room.type === RoomType.ConversationGroup,
            isGuidance: isGuidanceConversation(conv.members, guidanceVcId),
            members: conv.members,
          },
        ]
      : []
  );

  const incoming = useActiveCallRooms(enabled ? conversations : [], { withoutMe: true });
  // In a direct conversation the call was started by the other person.
  const callerNames = new Map<string, string | null>();
  for (const { room, members } of userConversations) {
    if (room && room.type !== RoomType.ConversationGroup) {
      callerNames.set(room.id, members.find(member => member.id !== userModel?.id)?.profile?.displayName ?? null);
    }
  }
  const incomingCallRooms: IncomingCallRooms = new Map(
    [...incoming].map(roomId => [roomId, callerNames.get(roomId) ?? null])
  );

  useEffect(() => {
    setIncomingCallRooms(incomingCallRooms);
  }, [incomingCallRooms]);
};
