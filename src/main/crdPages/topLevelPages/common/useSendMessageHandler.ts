import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToRoomMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useStartDirectChat } from '@/main/crdPages/unifiedChat/useStartDirectChat';

export type SendMessageHandlerResult = {
  onSendMessage: (messageText: string) => Promise<void>;
};

/**
 * Profile "Message" flow (US1): instead of a one-off email, open or create the
 * persistent 1:1 chat with the recipient (dedup-or-create, FR-002) and send the
 * message into that conversation's room. The chat panel is revealed so the
 * thread is immediately continuable (FR-001, FR-014).
 */
export const useSendMessageToUserHandler = (params: {
  recipientUserId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientUserId } = params;
  const { startDirectChat } = useStartDirectChat(recipientUserId);
  const [sendMessageToRoom] = useSendMessageToRoomMutation();

  const onSendMessage = async (messageText: string) => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    const { roomId } = await startDirectChat();
    await sendMessageToRoom({
      variables: {
        messageData: {
          roomID: roomId,
          message: messageText,
        },
      },
    });
  };

  return { onSendMessage };
};

/**
 * Email-fallback flow (US4 / FR-011): used only when the recipient has chat
 * disabled but has opted in to email contact (`!isContactable &&
 * isContactableViaEmail`). Routes to the retained `sendMessageToUsers` email
 * transport; the sender never sees the recipient's address.
 */
export const useSendEmailToUserHandler = (params: {
  recipientUserId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientUserId } = params;
  const { t } = useTranslation('crd-profilePages');
  const [sendMessageToUsers] = useSendMessageToUsersMutation();

  const onSendMessage = async (messageText: string) => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    await sendMessageToUsers({
      variables: {
        messageData: {
          message: messageText,
          receiverIds: [recipientUserId],
        },
      },
    });
    toast.success(t('common.messagePopover.emailSuccessToast'));
  };

  return { onSendMessage };
};

export const useSendMessageToOrganizationHandler = (params: {
  recipientOrganizationId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientOrganizationId } = params;
  const { t } = useTranslation('crd-profilePages');
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
    toast.success(t('common.messagePopover.successToast'));
  };

  return { onSendMessage };
};
