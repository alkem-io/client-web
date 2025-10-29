import React, { ReactNode, useCallback, useState } from 'react';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { DirectMessageDialog, MessageReceiverChipData } from './DirectMessageDialog';

interface UseDirectMessageDialogOptions {
  dialogTitle: ReactNode;
}

export interface SendMessage {
  (receiverType: ReceiverType, ...receivers: MessageReceiverChipData[]): void;
}

export type ReceiverType = 'user' | 'organization';

const useDirectMessageDialog = ({ dialogTitle }: UseDirectMessageDialogOptions) => {
  const [sendMessageToUser] = useSendMessageToUsersMutation();
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();

  const [receiverType, setReceiverType] = useState<ReceiverType>();
  const [directMessageReceivers, setDirectMessageReceivers] = useState<MessageReceiverChipData[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(!!directMessageReceivers);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!directMessageReceivers || directMessageReceivers.length === 0) {
        return;
      }

      switch (receiverType) {
        case 'user': {
          const receiverIds = directMessageReceivers?.map(r => r.id);

          await sendMessageToUser({
            variables: {
              messageData: {
                message: messageText,
                receiverIds,
              },
            },
          });

          return;
        }
        case 'organization': {
          const [{ id: organizationId }] = directMessageReceivers;

          await sendMessageToOrganization({
            variables: {
              messageData: {
                message: messageText,
                organizationId,
              },
            },
          });

          return;
        }
      }
    },
    [sendMessageToUser, sendMessageToOrganization, directMessageReceivers, receiverType]
  );

  const directMessageDialog = (
    <DirectMessageDialog
      title={dialogTitle}
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onSendMessage={handleSendMessage}
      messageReceivers={directMessageReceivers}
    />
  );

  const sendMessage = useCallback<SendMessage>(
    (receiverType: ReceiverType, ...receivers: MessageReceiverChipData[]) => {
      setDirectMessageReceivers(receivers);
      setReceiverType(receiverType);
      setIsDialogOpen(true);
    },
    []
  );

  return {
    sendMessage,
    directMessageDialog,
  };
};

export default useDirectMessageDialog;
