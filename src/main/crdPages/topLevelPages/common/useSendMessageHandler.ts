import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';

export type SendMessageHandlerResult = {
  onSendMessage: (messageText: string) => Promise<void>;
};

export const useSendMessageToUserHandler = (params: {
  recipientUserId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientUserId } = params;
  const [sendMessageToUser] = useSendMessageToUsersMutation();

  const onSendMessage = async (messageText: string) => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    await sendMessageToUser({
      variables: {
        messageData: {
          message: messageText,
          receiverIds: [recipientUserId],
        },
      },
    });
  };

  return { onSendMessage };
};

export const useSendMessageToOrganizationHandler = (params: {
  recipientOrganizationId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientOrganizationId } = params;
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();

  const onSendMessage = async (messageText: string) => {
    if (!recipientOrganizationId) {
      throw new Error('Recipient organization not loaded.');
    }
    await sendMessageToOrganization({
      variables: {
        messageData: {
          message: messageText,
          organizationId: recipientOrganizationId,
        },
      },
    });
  };

  return { onSendMessage };
};
