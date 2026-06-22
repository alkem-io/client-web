import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useStartDirectChat } from '@/main/crdPages/unifiedChat/useStartDirectChat';

export type SendMessageHandlerResult = {
  onSendMessage: (messageText: string) => Promise<void>;
};

export type OpenDirectChatHandlerResult = {
  onOpenChat: () => Promise<void>;
};

/**
 * Profile "Message" flow (US1, FR-001): clicking Message opens the chat panel
 * directly on the persistent 1:1 chat with the recipient — focusing the
 * existing conversation if one exists, creating and opening it otherwise
 * (dedup-or-create, FR-002). There is NO intermediate compose dialog: the user
 * writes inside the chat thread itself, so the handler opens/focuses the
 * conversation and does not send any message.
 */
export const useOpenDirectChatHandler = (params: {
  recipientUserId: string | undefined;
}): OpenDirectChatHandlerResult => {
  const { recipientUserId } = params;
  const { t } = useTranslation('crd-profilePages');
  const { startDirectChat } = useStartDirectChat(recipientUserId);

  const onOpenChat = async () => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    try {
      await startDirectChat();
    } catch {
      toast.error(t('common.messagePopover.openChatError'));
    }
  };

  return { onOpenChat };
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
