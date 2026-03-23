import { useEffect, useMemo, useState } from 'react';
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
    console.log(DEBUG, 'Timer started, will fire in', DELAY_MS, 'ms');
    const timer = setTimeout(() => {
      console.log(DEBUG, 'Timer fired, ready=true');
      setReady(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);

  useEffect(() => {
    console.log(DEBUG, 'Skip conditions:', { isEnabled, ready, isOpen, skip });
  }, [isEnabled, ready, isOpen, skip]);

  const { data, loading, error } = useUserConversationsUnreadCountQuery({
    skip,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (skip) return;
    console.log(DEBUG, 'Query state:', { loading, hasError: !!error, hasData: !!data });
    if (data?.me?.conversations?.conversations) {
      const convs = data.me.conversations.conversations;
      console.log(
        DEBUG,
        'Raw data from query:',
        convs.map(c => ({ id: c.id.slice(0, 8), roomId: c.room?.id?.slice(0, 8), unreadCount: c.room?.unreadCount }))
      );
    }
  }, [data, loading, error, skip]);

  const totalUnreadCount = useMemo(() => {
    if (!data?.me?.conversations?.conversations) return 0;
    return data.me.conversations.conversations.filter(conv => conv.room && conv.room.unreadCount > 0).length;
  }, [data?.me?.conversations?.conversations]);

  useEffect(() => {
    console.log(DEBUG, 'Computed totalUnreadCount:', totalUnreadCount);
  }, [totalUnreadCount]);

  return totalUnreadCount;
};
