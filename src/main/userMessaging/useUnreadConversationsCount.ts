import { useEffect, useState } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { displayedUnreadCount, useConversationSummaries } from './matrix/conversationSummaryStore';
import { useUserMessagingContext } from './UserMessagingContext';

const DELAY_MS = 2000;

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen, selectedRoomId } = useUserMessagingContext();
  const [ready, setReady] = useState(false);

  const skip = !isEnabled || (!ready && !isOpen);

  useEffect(() => {
    if (!isEnabled) return;
    const timer = setTimeout(() => {
      setReady(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);

  const { data } = useUserConversationsUnreadCountQuery({
    skip,
    fetchPolicy: 'cache-first',
  });

  // Counts conversations with unread messages, not messages; the per-room
  // counts come from Matrix sync, the conversation list from GraphQL.
  const roomIds = (data?.me?.conversations?.conversations ?? []).flatMap(conv => (conv.room ? [conv.room.id] : []));
  const summaries = useConversationSummaries(roomIds);
  const totalUnreadCount = roomIds.filter(roomId => displayedUnreadCount(summaries, roomId, selectedRoomId) > 0).length;

  return totalUnreadCount;
};
