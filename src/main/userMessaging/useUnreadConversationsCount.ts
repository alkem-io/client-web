import { gql, useQuery } from '@apollo/client';
import { useUserMessagingContext } from './UserMessagingContext';
import { useMemo, useState, useEffect } from 'react';

const DELAY_MS = 2000;

const UserConversationsUnreadCountDocument = gql`
  query UserConversationsUnreadCount {
    me {
      conversations {
        conversations {
          id
          room {
            id
            unreadCount
          }
        }
      }
    }
  }
`;

interface UserConversationsUnreadCountData {
  me?: {
    conversations?: {
      conversations?: {
        id: string;
        room?: {
          id: string;
          unreadCount: number;
        };
      }[];
    };
  };
}

export const useUnreadConversationsCount = () => {
  const { isEnabled, isOpen } = useUserMessagingContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    const timer = setTimeout(() => setReady(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEnabled]);

  const { data } = useQuery<UserConversationsUnreadCountData>(UserConversationsUnreadCountDocument, {
    skip: !isEnabled || (!ready && !isOpen),
    fetchPolicy: 'cache-first',
  });

  const totalUnreadCount = useMemo(() => {
    if (!data?.me?.conversations?.conversations) return 0;
    return data.me.conversations.conversations.filter(conv => conv.room && conv.room.unreadCount > 0).length;
  }, [data?.me?.conversations?.conversations]);

  return totalUnreadCount;
};
