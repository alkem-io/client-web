import { useEffect, useState } from 'react';
import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoomType } from '@/core/apollo/generated/graphql-schema';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isGuidanceConversation } from '@/main/crdPages/unifiedChat/dataMapper';
import { useGuidanceVcId } from '@/main/guidance/chatWidget/useGuidanceVcId';
import { storeFor, useConversationSummaries } from '../matrix/conversationSummaryStore';
import { useUserMessagingContext } from '../UserMessagingContext';
import { useIsDocumentActive } from '../useIsDocumentActive';
import { isCallsConfigured } from './callConfig';
import { type CallDismissals, dismissCall, isCallDismissed, useCallDismissals } from './callDismissalStore';
import { type IncomingCall, type IncomingCallRooms, setIncomingCallRooms } from './incomingCallStore';
import { type LiveCall, useLiveCalls } from './useActiveCallRooms';
import { type CallableConversation, isBetaTester, isCallableConversation } from './useCallEligibility';

// Kept off the startup path, like the unread count.
const DELAY_MS = 2000;

/** Joined on any device, seen in its open conversation, or already dealt with in some tab. */
const isDealtWith = (call: LiveCall, roomId: string, isSeen: boolean, dismissals: CallDismissals): boolean =>
  call.withMe || isSeen || isCallDismissed(dismissals, roomId, call.startedTs);

/**
 * Watches every callable conversation of the user, with the chat panel closed
 * too, for calls the user has not dealt with yet, and publishes them for the
 * unread signals. A call is dealt with, in every tab, once the user joins it on
 * any device, leaves it, or declines it; also once the user opens its
 * conversation while it runs and, in a 1:1, its ring has stopped.
 * It also tells the conversation summaries in which conversations a ring is an entry.
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

  // A ring is a timeline entry only in a 1:1 conversation with another person: in a group any member
  // could send one, unattributed. None while calls are hidden.
  const client = useMatrixClient();
  const ringRoomsKey = enabled
    ? conversations
        .filter(conversation => !conversation.isGroup && isCallableConversation(conversation))
        .map(conversation => conversation.roomId)
        .sort()
        .join('\n')
    : '';
  useEffect(() => {
    if (client) {
      storeFor(client).setRingRooms(new Set(ringRoomsKey === '' ? [] : ringRoomsKey.split('\n')));
    }
  }, [client, ringRoomsKey]);

  const dismissals = useCallDismissals();
  const isDocumentActive = useIsDocumentActive();
  // The conversation open here hides its call in this tab, a 1:1 one once its ring has stopped; it counts
  // as seen, for every tab, only while the user is in this tab: one left open in a background tab sees nothing.
  const openConversation = conversations.find(conversation => conversation.roomId === selectedRoomId);
  const openDirectSummary = useConversationSummaries(
    openConversation && !openConversation.isGroup ? [openConversation.roomId] : []
  )?.get(openConversation?.roomId ?? '');
  // The call's members reach this hook before its ring reaches the summary. Until the summary holds a ring
  // sent since the call started, "no ring rings there" only means the ring has not arrived yet.
  const openDirectCall = openConversation && !openConversation.isGroup ? liveCalls.get(openConversation.roomId) : null;
  const openDirectRingOver =
    openDirectCall &&
    openDirectSummary &&
    !openDirectSummary.ringing &&
    openDirectSummary.ringAt !== undefined &&
    openDirectSummary.ringAt >= openDirectCall.startedTs;
  const openSeenRoomId =
    openConversation && (openConversation.isGroup || openDirectRingOver) ? openConversation.roomId : null;
  const incoming = [...liveCalls].flatMap(([roomId, call]) =>
    isDealtWith(call, roomId, roomId === openSeenRoomId, dismissals) ? [] : [roomId]
  );

  // Remembers each call dealt with, and keeps up with members joining it later, so the call is
  // still recognised once the members who were in it back then have left.
  useEffect(() => {
    for (const [roomId, call] of liveCalls) {
      if (isDealtWith(call, roomId, isDocumentActive && roomId === openSeenRoomId, dismissals)) {
        dismissCall(roomId, call.latestTs);
      }
    }
  }, [liveCalls, openSeenRoomId, isDocumentActive, dismissals]);

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
