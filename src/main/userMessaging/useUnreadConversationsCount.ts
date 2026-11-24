import { useEffect, useSyncExternalStore } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useIncomingCallRooms } from './calls/incomingCallStore';
import { displayedUnreadCount, useConversationSummaries } from './matrix/conversationSummaryStore';
import { useUserMessagingContext } from './UserMessagingContext';

const DELAY_MS = 2000;

// The delay keeps this query out of the app's first load. It runs once for the whole app, shared by
// every instance of the hook: the header badge and the phone Home row become ready together, and a
// hook mounted after the delay reads the cached result on its first render.
let startupDelayPassed = false;
let startupTimer: ReturnType<typeof setTimeout> | undefined;
const readyListeners = new Set<() => void>();

const subscribeToStartupDelay = (listener: () => void) => {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
};

const startStartupDelay = () => {
  if (startupDelayPassed || startupTimer) return;
  startupTimer = setTimeout(() => {
    startupDelayPassed = true;
    for (const listener of readyListeners) listener();
  }, DELAY_MS);
};

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen, selectedRoomId } = useUserMessagingContext();
  const ready = useSyncExternalStore(subscribeToStartupDelay, () => startupDelayPassed);

  const skip = !isEnabled || (!ready && !isOpen);

  useEffect(() => {
    if (isEnabled) startStartupDelay();
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
