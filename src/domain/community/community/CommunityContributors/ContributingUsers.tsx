import Grid from '@mui/material/Grid';
import LoadingUserCard from '../../../shared/components/LoadingUserCard';
import Typography from '@mui/material/Typography';
import { UserCard } from '../../../../common/components/composite/common/cards';
import React, { useCallback, useState } from 'react';
import { SearchableUserCardProps } from '../CommunityUpdates/CommunityUpdatesDashboardSection';
import { useTranslation } from 'react-i18next';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import { useSendMessageToUserMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { compact } from 'lodash';

export interface ContributingUsersProps {
  loading?: boolean;
  users: SearchableUserCardProps[] | undefined;
}

const ContributingUsers = ({ users, loading = false }: ContributingUsersProps) => {
  const { t } = useTranslation();

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

  if (loading) {
    return (
      <Grid container spacing={3}>
        <LoadingUserCard />
        <LoadingUserCard />
        <LoadingUserCard />
      </Grid>
    );
  }

  if (!users?.length) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Typography>{t('pages.community.members.no-data')}</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Grid container spacing={3} columns={{ xs: 1, md: 2 }}>
        {users.map(user => (
          <Grid key={user.id} item xs={1}>
            <UserCard
              displayName={user.displayName}
              tags={user.tags}
              avatarSrc={user.avatarSrc}
              roleName={user.roleName}
              country={user.country}
              city={user.city}
              url={user.url}
              onContact={() =>
                setDirectMessageReceivers([
                  {
                    id: user.id,
                    title: user.displayName,
                    avatarUri: user.avatarSrc,
                    city: user.city,
                    country: user.country,
                  },
                ])
              }
            />
          </Grid>
        ))}
      </Grid>
      <DirectMessageDialog
        title={t('send-message-dialog.direct-message-title')}
        open={Boolean(directMessageReceivers?.length)}
        onClose={() => setDirectMessageReceivers(undefined)}
        onSendMessage={handleSendMessage}
        messageReceivers={directMessageReceivers}
      />
    </>
  );
};

export default ContributingUsers;
