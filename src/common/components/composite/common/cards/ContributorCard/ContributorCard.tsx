import { Avatar, Box, Paper, Skeleton, Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, MouseEventHandler, ReactNode, useCallback, useMemo, useState } from 'react';
import ConditionalLink from '../../../../core/ConditionalLink';
import UserCard from '../user-card/UserCard';
import withElevationOnHover from '../../../../../../domain/shared/components/withElevationOnHover';
import { useTranslation } from 'react-i18next';
import { useSendMessageToUserMutation } from '../../../../../../core/apollo/generated/apollo-hooks';
import { DirectMessageDialog } from '../../../../../../domain/communication/messaging/DirectMessaging/DirectMessageDialog';

interface ContributorCardTooltip {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
}

export interface ContributorCardProps {
  id: string;
  avatar: string;
  displayName: string;
  tooltip?: ContributorCardTooltip;
  url: string;
  isContactable?: boolean;
  roleName?: ReactNode;
}

const useStyles = makeStyles(_ =>
  createStyles({
    avatar: {
      height: '100%',
      width: '100%',
      '& > img': {
        objectFit: 'contain',
      },
    },
    wrapper: {
      minHeight: 64,
      minWidth: 64,
      aspectRatio: '1/1',
    },
    text: {
      fontSize: 10,
    },
    tooltip: {
      background: 'transparent',
    },
    skeleton: {
      minHeight: 64,
      minWidth: 64,
    },
  })
);

const ElevatedPaper = withElevationOnHover(Paper);

export const ContributorCard: FC<ContributorCardProps> = props => {
  const styles = useStyles();
  const { id, displayName, avatar, url, tooltip, isContactable, roleName } = props;
  const { t } = useTranslation();
  const [sendMessageToUser] = useSendMessageToUserMutation();
  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog: MouseEventHandler<HTMLButtonElement> = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsMessageUserDialogOpen(true);
  };

  const messageReceivers = [{ title: displayName, avatarUri: avatar, city: tooltip?.city, country: tooltip?.country }];

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!id) {
        throw new Error('User not loaded.');
      }

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

  const TooltipElement = useMemo(
    () =>
      ({ children }) =>
        tooltip ? (
          <Tooltip
            arrow
            title={
              <UserCard
                displayName={displayName}
                avatarSrc={avatar}
                tags={tooltip?.tags || []}
                roleName={roleName ?? tooltip?.roleName}
                city={tooltip?.city}
                country={tooltip?.country}
                url=""
                isContactable={isContactable}
                onContact={openMessageUserDialog}
              />
            }
            classes={{ tooltip: styles.tooltip }}
          >
            {children}
          </Tooltip>
        ) : (
          <>{children}</>
        ),
    [displayName, avatar, tooltip, styles.tooltip, isContactable]
  );

  return (
    <>
      <ConditionalLink to={url} condition={Boolean(url)} aria-label="associate-card">
        <ElevatedPaper>
          <Box className={styles.wrapper}>
            <TooltipElement>
              <Avatar variant="rounded" className={styles.avatar} src={avatar}>
                {displayName[0]}
              </Avatar>
            </TooltipElement>
          </Box>
        </ElevatedPaper>
      </ConditionalLink>
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

export const ContributorCardSkeleton = () => {
  const styles = useStyles();
  return (
    <Box className={styles.wrapper}>
      <Avatar variant="rounded" className={styles.avatar}>
        <Skeleton variant="rectangular" className={styles.skeleton} />
      </Avatar>
    </Box>
  );
};

export default ContributorCard;
