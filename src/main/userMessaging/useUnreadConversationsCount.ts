import { useEffect, useState } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useIncomingCallRooms } from './calls/incomingCallStore';
import { displayedUnreadCount, useConversationSummaries } from './matrix/conversationSummaryStore';
import { useUserMessagingContext } from './UserMessagingContext';

const DELAY_MS = 2000;

// The delay keeps this query out of the app's first load. Once it has passed for any instance, a
// hook mounted later (the phone Home row) reads the cached result at once, in step with the header.
let startupDelayPassed = false;

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen, selectedRoomId } = useUserMessagingContext();
  const [ready, setReady] = useState(startupDelayPassed);

  const skip = !isEnabled || (!ready && !isOpen);

  useEffect(() => {
    if (!isEnabled || startupDelayPassed) return;
    const timer = setTimeout(() => {
      startupDelayPassed = true;
      setReady(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);

  const { data } = useUserConversationsUnreadCountQuery({
    skip,
    fetchPolicy: 'cache-first',
  });

  // Counts conversations with unread messages or a call the user has not dealt with yet, not
  // messages; the per-room counts come from Matrix sync, the conversation list from GraphQL.
  const roomIds = (data?.me?.conversations?.conversations ?? []).flatMap(conv => (conv.room ? [conv.room.id] : []));
  const summaries = useConversationSummaries(roomIds);
  const incomingCallRooms = useIncomingCallRooms();
  const totalUnreadCount = roomIds.filter(
    roomId => displayedUnreadCount(summaries, roomId, selectedRoomId) > 0 || incomingCallRooms.has(roomId)
  ).length;

  return totalUnreadCount;
};
