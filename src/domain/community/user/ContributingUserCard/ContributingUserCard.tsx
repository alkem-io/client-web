import { DirectMessageDialog } from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import { useCallback, useState } from 'react';
import { useSendMessageToUsersMutation } from '@/core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { ContributorCardProps } from '@/domain/community/contributor/ContributorCard/ContributorCard';
import UserCard from '../userCard/UserCard';

interface ContributingUserCardProps extends ContributorCardProps {
  id: string;
  isContactable: boolean;
}

const ContributingUserCard = ({ id, isContactable, ...contributorCardProps }: ContributingUserCardProps) => {
  const { t } = useTranslation();

  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);
  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog = () => setIsMessageUserDialogOpen(true);

  const messageReceivers = [
    {
      id,
      displayName: contributorCardProps.displayName,
      avatarUri: contributorCardProps.avatarUri,
      city: contributorCardProps.city,
      country: contributorCardProps.country,
    },
  ];

  const [sendMessageToUser] = useSendMessageToUsersMutation();

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
      <UserCard
        avatarSrc={contributorCardProps.avatarUri}
        avatarAltText={t('common.avatar-of', { user: contributorCardProps.displayName })}
        isContactable={isContactable}
        onContact={openMessageUserDialog}
        url={contributorCardProps.userUri}
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
