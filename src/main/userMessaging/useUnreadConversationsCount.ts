import { useEffect, useState } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from './UserMessagingContext';

const DELAY_MS = 2000;

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen } = useUserMessagingContext();
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

  const totalUnreadCount = (() => {
    if (!data?.me?.conversations?.conversations) return 0;
    return data.me.conversations.conversations.filter(conv => conv.room && conv.room.unreadCount > 0).length;
  })();

  return totalUnreadCount;
};
