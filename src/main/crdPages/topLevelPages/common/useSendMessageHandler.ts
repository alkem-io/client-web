import { useState, useTransition } from 'react';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';

export type SendMessageHandlerResult = {
  /** Recipient-bound `(text) => Promise<void>` consumed by the CRD heroes. */
  onSendMessage: (messageText: string) => Promise<void>;
  /** True while the mutation is in flight (sourced from `useTransition`). */
  sending: boolean;
  /** Last failure message, or `null` when no failure is currently surfaced. */
  error: string | null;
};

// React 19 `startTransition` does not surface the action's promise to the
// caller, so we wrap the work in an explicit Promise to preserve the awaitable
// contract that `MessagePopover.onSendMessage` relies on while still letting
// the transition control the `isPending` flag.
const runInTransition = <T>(
  startTransition: (action: () => void | Promise<void>) => void,
  work: () => Promise<T>
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    startTransition(async () => {
      try {
        resolve(await work());
      } catch (caught) {
        reject(caught);
      }
    });
  });

const errorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error && caught.message ? caught.message : fallback;

export const useSendMessageToUserHandler = (params: {
  recipientUserId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientUserId } = params;
  const [sendMessageToUser] = useSendMessageToUsersMutation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSendMessage = async (messageText: string) => {
    if (!recipientUserId) {
      throw new Error('Recipient user not loaded.');
    }
    setError(null);
    try {
      await runInTransition(startTransition, async () => {
        await sendMessageToUser({
          variables: {
            messageData: {
              message: messageText,
              receiverIds: [recipientUserId],
            },
          },
        });
      });
    } catch (caught) {
      const message = errorMessage(caught, 'Failed to send message.');
      setError(message);
      throw caught;
    }
  };

  return { onSendMessage, sending: isPending, error };
};

export const useSendMessageToOrganizationHandler = (params: {
  recipientOrganizationId: string | undefined;
}): SendMessageHandlerResult => {
  const { recipientOrganizationId } = params;
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSendMessage = async (messageText: string) => {
    if (!recipientOrganizationId) {
      throw new Error('Recipient organization not loaded.');
    }
    setError(null);
    try {
      await runInTransition(startTransition, async () => {
        await sendMessageToOrganization({
          variables: {
            messageData: {
              message: messageText,
              organizationId: recipientOrganizationId,
            },
          },
        });
      });
    } catch (caught) {
      const message = errorMessage(caught, 'Failed to send message.');
      setError(message);
      throw caught;
    }
  };

  return { onSendMessage, sending: isPending, error };
};
