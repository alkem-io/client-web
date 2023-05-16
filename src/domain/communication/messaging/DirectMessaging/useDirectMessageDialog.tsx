import React, { ReactNode, useCallback, useState } from 'react';
import { compact } from 'lodash';
import { useSendMessageToUserMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { DirectMessageDialog, MessageReceiverChipData } from './DirectMessageDialog';

interface UseDirectMessageDialogOptions {
  dialogTitle: ReactNode;
}

const useDirectMessageDialog = ({ dialogTitle }: UseDirectMessageDialogOptions) => {
  const [sendMessageToUser] = useSendMessageToUserMutation();
  const [directMessageReceivers, setDirectMessageReceivers] = useState<MessageReceiverChipData[]>();
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      const receiverIds = compact(directMessageReceivers?.map(r => r.id));
      if (!receiverIds || receiverIds.length === 0) {
        return;
      }

      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds,
          },
        },
      });
    },
    [sendMessageToUser, directMessageReceivers]
  );

  const directMessageDialog = (
    <DirectMessageDialog
      title={dialogTitle}
      open={Boolean(directMessageReceivers?.length)}
      onClose={() => setDirectMessageReceivers(undefined)}
      onSendMessage={handleSendMessage}
      messageReceivers={directMessageReceivers}
    />
  );

  const sendMessage = useCallback((receivers: MessageReceiverChipData[]) => {
    setDirectMessageReceivers(receivers);
  }, []);

  return {
    sendMessage,
    directMessageDialog,
  };
};

export default useDirectMessageDialog;
