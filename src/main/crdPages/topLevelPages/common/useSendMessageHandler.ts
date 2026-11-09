import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import { useStartDirectChat } from '@/main/crdPages/unifiedChat/useStartDirectChat';

export type SendMessageHandlerResult = {
  onSendMessage: (messageText: string) => Promise<void>;
};

export type OpenDirectChatHandlerResult = {
  onOpenChat: (targetUserId?: string) => Promise<void>;
};

/**
 * Profile "Message" flow (US1, FR-001): clicking Message opens the chat panel
 * directly on the persistent 1:1 chat with the recipient — focusing the
 * existing conversation if one exists, creating and opening it otherwise
 * (dedup-or-create, FR-002). There is NO intermediate compose dialog: the user
 * writes inside the chat thread itself, so the handler opens/focuses the
 * conversation and does not send any message.
 *
 * `onOpenChat` takes an optional call-time recipient for hosts that list many
 * contributors; it defaults to `recipientUserId`.
 */
export const useOpenDirectChatHandler = (params: {
  recipientUserId: string | undefined;
}): OpenDirectChatHandlerResult => {
  const { recipientUserId } = params;
  // The eagerly loaded default namespace: hosts never suspend and the toast never shows a raw key.
  const { t } = useTranslation('crd-common');
  const { startDirectChat } = useStartDirectChat(recipientUserId);

  const onOpenChat = async (targetUserId: string | undefined = recipientUserId) => {
    if (!targetUserId) {
      throw new Error('Recipient user not loaded.');
    }
    try {
      await startDirectChat(targetUserId);
    } catch (err) {
      const code = err instanceof ApolloError ? err.graphQLErrors[0]?.extensions?.code : undefined;
      toast.error(
        code === AlkemioGraphqlErrorCode.MESSAGING_NOT_ENABLED
          ? t('apollo.errors.MESSAGING_NOT_ENABLED')
          : t('apollo.errors.UNSPECIFIED')
      );
    }
  };

  return { onOpenChat };
};

/** The hover card's Message action for hosts that list many contributors: a direct chat with the one clicked. */
export const useMessageContributor = () => {
  const { onOpenChat } = useOpenDirectChatHandler({ recipientUserId: undefined });
  return (contributor: Pick<ContributorPreviewData, 'id'>) => void onOpenChat(contributor.id);
};

/**
 * Email-fallback flow (US4 / FR-011): used only when the recipient has chat
 * disabled but has opted in to email contact (`!isContactable &&
 * isContactableViaEmail`). Routes to the retained `sendMessageToUsers` email
 * transport; the sender never sees the recipient's address.
 *
 * NOTE: temporarily UNUSED — the user email-contact route is disabled
 * client-side (see CrdUserProfilePage.tsx and the user settings tab). Kept in
 * place so the route can be re-enabled without re-implementing it.
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
