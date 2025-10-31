import {
  useSendMessageToOrganizationMutation,
  useSendMessageToUsersMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import Avatar from '@/core/ui/avatar/Avatar';
import GridProvider from '@/core/ui/grid/GridProvider';
import { gutters } from '@/core/ui/grid/utils';
import ConditionalLink from '@/core/ui/link/ConditionalLink';
import { DirectMessageDialog } from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import UserCard from '@/domain/community/user/userCard/UserCard';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';
import { Box, Paper, Skeleton, Tooltip } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ContributorCardTooltip = {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
};

export interface ContributorCardSquareProps {
  id: string;
  avatar: string | undefined;
  avatarAltText?: string;
  displayName: string;
  tooltip?: ContributorCardTooltip;
  url: string;
  isContactable?: boolean;
  contributorType: RoleSetContributorType;
  roleName?: ReactNode;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

export const ContributorCardSquare = (props: ContributorCardSquareProps) => {
  const { id, displayName, avatar, avatarAltText, url, tooltip, isContactable, roleName, contributorType } = props;
  const { t } = useTranslation();
  const [sendMessageToUser] = useSendMessageToUsersMutation();
  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const messageReceivers = [{ id, displayName, avatarUri: avatar, city: tooltip?.city, country: tooltip?.country }];

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!id) {
        throw new Error('User not loaded.');
      }

      if (contributorType === RoleSetContributorType.User) {
        await sendMessageToUser({
          variables: {
            messageData: {
              message: messageText,
              receiverIds: [id],
            },
          },
        });
      }
      if (contributorType === RoleSetContributorType.Organization) {
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
                <Box width={gutters(15)}>
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
                </Box>
              </GridProvider>
            }
            componentsProps={{ tooltip: { sx: { bgcolor: 'transparent' } } }}
          >
            <Box>{children}</Box>
          </Tooltip>
        ) : (
          <>{children}</>
        ),
    [displayName, avatar, tooltip, isContactable]
  );

  return (
    <>
      <ConditionalLink to={url} condition={Boolean(url)} aria-label="associate-card">
        <ElevatedPaper>
          <Box sx={{ minHeight: 64, minWidth: 64, aspectRatio: '1/1' }}>
            <TooltipElement>
              <Avatar
                variant="rounded"
                src={avatar}
                sx={{ height: 1, width: 1 }}
                alt={avatarAltText ? t('common.avatar-of', { user: avatarAltText }) : t('common.avatar')}
              >
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
  return (
    <Box sx={{ minHeight: 64, minWidth: 64, aspectRatio: '1/1' }}>
      <Avatar variant="rounded" sx={{ height: 1, width: 1 }}>
        <Skeleton variant="rectangular" sx={{ minHeight: 64, minWidth: 64 }} />
      </Avatar>
    </Box>
  );
};

export default ContributorCardSquare;
