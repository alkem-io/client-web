import { useCallback } from 'react';
import { useSendMessageToCommunityLeadsMutation } from '@/core/apollo/generated/apollo-hooks';

const useSendMessageToCommunityLeads = (communityId: string | undefined) => {
  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();

  return useCallback(
    async (messageText: string) => {
      if (!communityId) {
        throw new Error('Community is not loaded');
      }

      await sendMessageToCommunityLeads({
        variables: {
          messageData: {
            message: messageText,
            communityId,
          },
        },
      });
    },
    [sendMessageToCommunityLeads, communityId]
  );
};

export default useSendMessageToCommunityLeads;
