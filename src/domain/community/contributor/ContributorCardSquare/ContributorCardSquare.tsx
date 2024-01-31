import { Box, Paper, Skeleton, Tooltip } from '@mui/material';
import Avatar from '../../../../core/ui/avatar/Avatar';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import ConditionalLink from '../../../../core/ui/link/ConditionalLink';
import UserCard from '../../user/userCard/UserCard';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import { useTranslation } from 'react-i18next';
import { useSendMessageToUserMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';

interface ContributorCardTooltip {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
}

export interface ContributorCardSquareProps {
  id: string;
  avatar: string;
  avatarAltText?: string;
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

export const ContributorCardSquare: FC<ContributorCardSquareProps> = props => {
  const styles = useStyles();
  const { id, displayName, avatar, avatarAltText, url, tooltip, isContactable, roleName } = props;
  const { t } = useTranslation();
  const [sendMessageToUser] = useSendMessageToUserMutation();
  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const messageReceivers = [{ id, displayName, avatarUri: avatar, city: tooltip?.city, country: tooltip?.country }];

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
                avatarAltText={avatarAltText}
                tags={tooltip?.tags || []}
                roleName={roleName ?? tooltip?.roleName}
                city={tooltip?.city}
                country={tooltip?.country}
                isContactable={isContactable}
                onContact={() => setIsMessageUserDialogOpen(true)}
              />
            }
            classes={{ tooltip: styles.tooltip }}
          >
            <Box>{children}</Box>
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
        onClose={() => setIsMessageUserDialogOpen(false)}
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

export default ContributorCardSquare;
