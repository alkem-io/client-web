import { useConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

export const useConversationsUnreadCount = () => {
  const { isEnabled } = useUserMessagingContext();
  const { data } = useConversationsUnreadCountQuery({ skip: !isEnabled });
  return data?.me?.conversationsUnreadCount ?? 0;
};
