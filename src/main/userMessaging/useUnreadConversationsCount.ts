import { useEffect, useState } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from './UserMessagingContext';

const DELAY_MS = 2000;
const DEBUG = '[UnreadCount]';

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen } = useUserMessagingContext();
  const [ready, setReady] = useState(false);

  const skip = !isEnabled || (!ready && !isOpen);

  useEffect(() => {
    if (!isEnabled) return;
    // biome-ignore lint/suspicious/noConsole: debug logging
    console.log(DEBUG, 'Timer started, will fire in', DELAY_MS, 'ms');
    const timer = setTimeout(() => {
      // biome-ignore lint/suspicious/noConsole: debug logging
      console.log(DEBUG, 'Timer fired, ready=true');
      setReady(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: debug logging
    console.log(DEBUG, 'Skip conditions:', { isEnabled, ready, isOpen, skip });
  }, [isEnabled, ready, isOpen, skip]);

  const { data, loading, error } = useUserConversationsUnreadCountQuery({
    skip,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (skip) return;
    // biome-ignore lint/suspicious/noConsole: debug logging
    console.log(DEBUG, 'Query state:', { loading, hasError: !!error, hasData: !!data });
    if (data?.me?.conversations?.conversations) {
      const convs = data.me.conversations.conversations;
      // biome-ignore lint/suspicious/noConsole: debug logging
      console.log(
        DEBUG,
        'Raw data from query:',
        convs.map(c => ({ id: c.id.slice(0, 8), roomId: c.room?.id?.slice(0, 8), unreadCount: c.room?.unreadCount }))
      );
    }
  }, [data, loading, error, skip]);

  const totalUnreadCount = (() => {
    if (!data?.me?.conversations?.conversations) return 0;
    return data.me.conversations.conversations.filter(conv => conv.room && conv.room.unreadCount > 0).length;
  })();

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: debug logging
    console.log(DEBUG, 'Computed totalUnreadCount:', totalUnreadCount);
  }, [totalUnreadCount]);

  return totalUnreadCount;
};
