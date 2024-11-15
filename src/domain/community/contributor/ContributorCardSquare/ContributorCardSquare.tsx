import { Box, Paper, Skeleton, Tooltip } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import ConditionalLink from '@/core/ui/link/ConditionalLink';
import UserCard from '../../user/userCard/UserCard';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import { useTranslation } from 'react-i18next';
import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import GridProvider from '@/core/ui/grid/GridProvider';
import { CommunityContributorType } from '@/core/apollo/generated/graphql-schema';

interface ContributorCardTooltip {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
}

export interface ContributorCardSquareProps {
  id: string;
  avatar: string | undefined;
  avatarAltText?: string;
  displayName: string;
  tooltip?: ContributorCardTooltip;
  url: string;
  isContactable?: boolean;
  contributorType: CommunityContributorType;
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

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

export const ContributorCardSquare: FC<ContributorCardSquareProps> = props => {
  const styles = useStyles();
  const { id, displayName, avatar, avatarAltText, url, tooltip, isContactable, roleName, contributorType } = props;
  const { t } = useTranslation();
  const [sendMessageToUser] = useSendMessageToUserMutation();
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const messageReceivers = [{ id, displayName, avatarUri: avatar, city: tooltip?.city, country: tooltip?.country }];

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!id) {
        throw new Error('User not loaded.');
      }

      if (contributorType === CommunityContributorType.User) {
        await sendMessageToUser({
          variables: {
            messageData: {
              message: messageText,
              receiverIds: [id],
            },
          },
        });
      }
      if (contributorType === CommunityContributorType.Organization) {
        await sendMessageToOrganization({
          variables: {
            messageData: {
              message: messageText,
              organizationId: id,
            },
          },
        });
      }
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
              <GridProvider columns={3}>
                <UserCard
                  displayName={displayName}
                  avatarSrc={avatar}
                  avatarAltText={avatarAltText}
                  tags={tooltip?.tags ?? []}
                  roleName={roleName ?? tooltip?.roleName}
                  city={tooltip?.city}
                  country={tooltip?.country}
                  isContactable={isContactable}
                  onContact={() => setIsMessageUserDialogOpen(true)}
                />
              </GridProvider>
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
