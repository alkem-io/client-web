import { useState } from 'react';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';

export type SendMessageHandlerResult = {
  /** Recipient-bound `(text) => Promise<void>` — the only API the CRD heroes consume. */
  onSendMessage: (messageText: string) => Promise<void>;
  sending: boolean;
};

/**
 * User-recipient send-message handler.
 *
 * Wraps `useSendMessageToUsersMutation` with the recipient user id baked in.
 * Same signature as `useSendMessageToOrganizationHandler` so the two heroes
 * stay recipient-agnostic (`onSendMessage(text)` only). Errors are re-thrown
 * so the consuming `MessagePopover` can surface them in its own UI.
 *
 * NOTE: User and Organization use **different** GraphQL mutations with
 * different input shapes — User: `{ message, receiverIds: [userId] }`,
 * Organization: `{ message, organizationId }`. The presentational
 * `MessagePopover` is recipient-agnostic; only the integration hooks differ.
 */
export const useSendMessageToUserHandler = (params: {
  recipientUserId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientUserId } = params;
  const [sendMessageToUser] = useSendMessageToUsersMutation();
  const [sending, setSending] = useState(false);

  const onSendMessage = async (messageText: string) => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    setSending(true);
    try {
      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [recipientUserId],
          },
        },
      });
    } finally {
      setSending(false);
    }
  };

  return { onSendMessage, sending };
};

/**
 * Organization-recipient send-message handler.
 *
 * Wraps `useSendMessageToOrganizationMutation` (parity with current MUI
 * `useOrganizationProvider().handleSendMessage`).
 */
export const useSendMessageToOrganizationHandler = (params: {
  recipientOrganizationId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientOrganizationId } = params;
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const [sending, setSending] = useState(false);

  const onSendMessage = async (messageText: string) => {
    if (!recipientOrganizationId) {
      throw new Error('Recipient organization not loaded.');
    }
    setSending(true);
    try {
      await sendMessageToOrganization({
        variables: {
          messageData: {
            message: messageText,
            organizationId: recipientOrganizationId,
          },
        },
      });
    } finally {
      setSending(false);
    }
  };

  return { onSendMessage, sending };
};
