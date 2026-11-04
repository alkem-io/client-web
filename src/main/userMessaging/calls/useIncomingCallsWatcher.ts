import { useEffect, useState } from 'react';
import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoomType } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isGuidanceConversation } from '@/main/crdPages/unifiedChat/dataMapper';
import { useGuidanceVcId } from '@/main/guidance/chatWidget/useGuidanceVcId';
import { useUserMessagingContext } from '../UserMessagingContext';
import { isCallsConfigured } from './callConfig';
import { type CallDismissals, dismissCall, isCallDismissed, useCallDismissals } from './callDismissalStore';
import { type IncomingCall, type IncomingCallRooms, setIncomingCallRooms } from './incomingCallStore';
import { type LiveCall, useLiveCalls } from './useActiveCallRooms';
import { type CallableConversation, isBetaTester } from './useCallEligibility';

// Kept off the startup path, like the unread count.
const DELAY_MS = 2000;

/** Joined on any device, open in this tab, or already dealt with in some tab. */
const isDealtWith = (
  call: LiveCall,
  roomId: string,
  selectedRoomId: string | null,
  dismissals: CallDismissals
): boolean => call.withMe || roomId === selectedRoomId || isCallDismissed(dismissals, roomId, call.startedTs);

/**
 * Watches every callable conversation of the user, with the chat panel closed
 * too, for calls the user has not dealt with yet, and publishes them for the
 * unread signals. A call is dealt with, in every tab, once the user opens its
 * conversation while it runs, joins it on any device, or leaves it.
 * The sound for a call starting comes from its notification event (useSyncChatSound).
 */
export const useIncomingCallsWatcher = () => {
  const { isEnabled, selectedRoomId } = useUserMessagingContext();
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

  const liveCalls = useLiveCalls(enabled ? conversations : []);
  const dismissals = useCallDismissals();
  const incoming = [...liveCalls].flatMap(([roomId, call]) =>
    isDealtWith(call, roomId, selectedRoomId, dismissals) ? [] : [roomId]
  );

  // Remembers each call dealt with, and keeps up with members joining it later, so the call is
  // still recognised once the members who were in it back then have left.
  useEffect(() => {
    for (const [roomId, call] of liveCalls) {
      if (isDealtWith(call, roomId, selectedRoomId, dismissals)) {
        dismissCall(roomId, call.latestTs);
      }
    }
  }, [liveCalls, selectedRoomId, dismissals]);

  // A group call is named after the group; a direct one after the other person, who started it.
  const calls = new Map<string, IncomingCall | null>();
  for (const { room, members } of userConversations) {
    if (room) {
      const isGroup = room.type === RoomType.ConversationGroup;
      const name = isGroup
        ? room.displayName
        : members.find(member => member.id !== userModel?.id)?.profile?.displayName;
      calls.set(room.id, name ? { name, isGroup } : null);
    }
  }
  const incomingCallRooms: IncomingCallRooms = new Map(incoming.map(roomId => [roomId, calls.get(roomId) ?? null]));

  useEffect(() => {
    setIncomingCallRooms(incomingCallRooms);
  }, [incomingCallRooms]);
};
