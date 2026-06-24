import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendDirectMessageToUsersMutation } from '@/core/apollo/generated/apollo-hooks';
import { DirectMessageDeliveryStatus } from '@/core/apollo/generated/graphql-schema';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { type ContactLeadRecipient, ContactLeadsDialog } from '@/crd/components/chat/ContactLeadsDialog';
import { SendConfirmationDialog } from '@/crd/components/chat/SendConfirmationDialog';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

export type ContactLeadsDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: ContactLeadRecipient[];
};

/**
 * Integration glue for the CRD "Contact the leads" flow (US3): fans the message
 * out to each lead individually via `sendDirectMessageToUsers`, then shows the
 * shared confirmation — surfacing any not-reached leads (FR-013).
 */
export const ContactLeadsDialogConnector = ({ open, onOpenChange, recipients }: ContactLeadsDialogConnectorProps) => {
  const { t } = useTranslation('crd-chat');
  const notify = useNotification();
  const { setIsOpen, setSelectedConversationId } = useUserMessagingContext();

  const [sendDirectMessage, { loading: sending }] = useSendDirectMessageToUsersMutation();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [notReached, setNotReached] = useState<string[]>([]);
  const [sentConversationIds, setSentConversationIds] = useState<string[]>([]);

  const handleSend = async (message: string) => {
    const { data } = await sendDirectMessage({
      variables: {
        messageData: {
          receiverIDs: recipients.map(r => r.id),
          message,
        },
      },
    });

    const results = data?.sendDirectMessageToUsers ?? [];
    const byReceiver = new Map(results.map(result => [result.receiverID, result]));

    const failedNames = recipients
      .filter(r => byReceiver.get(r.id)?.status !== DirectMessageDeliveryStatus.Sent)
      .map(r => r.displayName);

    const sentIds = results
      .filter(result => result.status === DirectMessageDeliveryStatus.Sent && result.conversationID)
      .map(result => result.conversationID as string);

    setNotReached(failedNames);
    setSentConversationIds(sentIds);
    onOpenChange(false);
    setConfirmationOpen(true);
  };

  const handleSendWithErrorBoundary = async (message: string) => {
    try {
      await handleSend(message);
    } catch {
      notify(t('contactLeads.errors.sendFailed'), 'error');
      // Re-throw so the dialog keeps the draft (does not close on failure).
      throw new Error('send-failed');
    }
  };

  const handleOpenChat = () => {
    // Multiple leads were messaged individually, so there is no single thread to
    // land in — open the chat panel on the conversation list (null selection).
    // Only when exactly one lead was reached do we focus that conversation.
    setSelectedConversationId(sentConversationIds.length === 1 ? sentConversationIds[0] : null);
    setIsOpen(true);
    setConfirmationOpen(false);
  };

  return (
    <>
      <ContactLeadsDialog
        open={open}
        onOpenChange={onOpenChange}
        recipients={recipients}
        maxLength={LONG_TEXT_LENGTH}
        sending={sending}
        onSend={handleSendWithErrorBoundary}
      />
      <SendConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        notReached={notReached}
        onOpenChat={sentConversationIds.length > 0 ? handleOpenChat : undefined}
      />
    </>
  );
};
