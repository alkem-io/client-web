import { IconButton } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import React, { MouseEventHandler, useCallback, useState } from 'react';
import { useSendMessageToUserMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import ContributorCard, { ContributorCardProps } from '../../contributor/ContributorCard/ContributorCard';

interface ContributingUserCardProps extends ContributorCardProps {
  id: string;
}

const ContributingUserCard = ({ id, ...contributorCardProps }: ContributingUserCardProps) => {
  const { t } = useTranslation();

  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);
  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog: MouseEventHandler<HTMLButtonElement> = event => {
    // Since ContributorCard is an <a>, we need to call preventDefault instead of stopPropagation
    // to suppress the default behavior of going to the parent "href"
    event.preventDefault();
    setIsMessageUserDialogOpen(true);
  };

  const messageReceivers = [
    {
      id,
      displayName: contributorCardProps.displayName,
      avatarUri: contributorCardProps.avatarUri,
      city: contributorCardProps.city,
      country: contributorCardProps.country,
    },
  ];

  const [sendMessageToUser] = useSendMessageToUserMutation();

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [id],
          },
        },
      });
    },
    [sendMessageToUser, id]
  );

  return (
    <>
      <ContributorCard
        headerActions={
          <IconButton onClick={openMessageUserDialog} aria-label={t('common.email')}>
            <EmailOutlinedIcon color="primary" />
          </IconButton>
        }
        {...contributorCardProps}
      />
      <DirectMessageDialog
        title={t('send-message-dialog.direct-message-title')}
        open={isMessageUserDialogOpen}
        onClose={closeMessageUserDialog}
        onSendMessage={handleSendMessage}
        messageReceivers={messageReceivers}
      />
    </>
  );
};

export default ContributingUserCard;
