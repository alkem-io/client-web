import { useEffect, useState } from 'react';
import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoomType } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isGuidanceConversation } from '@/main/crdPages/unifiedChat/dataMapper';
import { useUnifiedChatContext } from '@/main/crdPages/unifiedChat/UnifiedChatProvider';
import { useUserMessagingContext } from '../UserMessagingContext';
import { isCallsConfigured } from './callConfig';
import { setIncomingCallRooms } from './incomingCallStore';
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
  const { platformRoles } = useCurrentUserContext();
  const { guidanceVcId } = useUnifiedChatContext();
  const enabled = isEnabled && isBetaTester(platformRoles) && isCallsConfigured();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setReady(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  // The chat panel's own list query: the room type and member types tell which conversations take calls.
  const { data } = useUserConversationsQuery({ skip: !enabled || !ready, fetchPolicy: 'cache-first' });
  const conversations: CallableConversation[] = (data?.me?.conversations?.conversations ?? []).flatMap(conv =>
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

  useEffect(() => {
    setIncomingCallRooms(incoming);
  }, [incoming]);
};
