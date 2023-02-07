import React, { FC, useState } from 'react';
import { Dialog, TextField, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import DialogContent from '../../../common/components/core/dialog/DialogContent';
import { PageTitle } from '../../../core/ui/typography/components';
import { useSendMessageToUserMutation } from '../../../core/apollo/generated/apollo-hooks';
import { LoadingButton } from '@mui/lab';

interface MessageUserDialogProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const MessageUserDialog: FC<MessageUserDialogProps> = ({ userId, open, onClose }) => {
  const { t } = useTranslation();
  const [isLoading, setIsloading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendMessageToUser] = useSendMessageToUserMutation();
  const handleSendMessage = async () => {
    setIsloading(false);
    const { data } = await sendMessageToUser({
      variables: {
        messageData: {
          message: messageText,
          receiverIds: [userId],
        },
      },
    });
    if (data?.sendMessageToUser) {
      // showInfoText Message succesfully sent
    }
    setIsloading(false);
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeader onClose={onClose}>
        <PageTitle>{}</PageTitle>
      </DialogHeader>
      <DialogContent>
        <TextField value={messageText} onChange={handleTextChange} fullWidth />
        <DialogActions sx={{ p: 0, marginTop: 2 }}>
          <LoadingButton loading={isLoading} disabled={isLoading} variant="contained" onClick={handleSendMessage}>
            {t('buttons.send')}
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
