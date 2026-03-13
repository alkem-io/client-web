import { Box, Link, styled, Tooltip, useTheme } from '@mui/material';
import { type FC, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendMessageToUsersMutation } from '@/core/apollo/generated/apollo-hooks';
import Avatar, { type CustomAvatarProps } from '@/core/ui/avatar/Avatar';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridProvider from '@/core/ui/grid/GridProvider';
import { DirectMessageDialog } from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import UserCard from '@/domain/community/user/userCard/UserCard';
import type { AuthorModel } from '../../../community/user/models/AuthorModel';

const UserAvatar = styled(Avatar)<CustomAvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
}));

export interface AuthorAvatarProps {
  author: AuthorModel | undefined;
}

export const AuthorAvatar: FC<AuthorAvatarProps> = ({ author }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const anchorElement = useRef<HTMLDivElement>(null);
  const [sendMessageToUser] = useSendMessageToUsersMutation();
  const [isContactDialogVisible, setContactDialogVisible] = useState(false);
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!author || !author.id) {
        return;
      }

      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [author.id],
          },
        },
      });
    },
    [sendMessageToUser]
  );

  const TooltipElement = useMemo(
    () =>
      ({ children }) =>
        author ? (
          <Tooltip
            arrow={true}
            slotProps={{
              popper: {
                anchorEl: anchorElement.current,
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: ({ placement }) => (placement === 'top' ? [0, 0] : [0, theme.avatarSizeXs]),
                    },
                  },
                ],
              },
            }}
            title={
              <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
                <UserCard
                  displayName={author.displayName}
                  avatarSrc={author.avatarUrl}
                  tags={author.tags}
                  city={author.city}
                  country={author.country}
                  url={author.url}
                  onContact={() => setContactDialogVisible(true)}
                />
              </GridProvider>
            }
            PopperProps={{
              sx: { '& > .MuiTooltip-tooltip': { background: 'transparent' } },
            }}
          >
            <Box>
              <Box ref={anchorElement} />
              {children}
            </Box>
          </Tooltip>
        ) : (
          children
        ),
    [author, setContactDialogVisible]
  );

  return (
    <>
      <TooltipElement>
        <Link href={author?.url}>
          <UserAvatar src={author?.avatarUrl} alt={t('common.avatar-of', { user: author?.displayName })}>
            {author?.displayName}
          </UserAvatar>
        </Link>
      </TooltipElement>
      <DirectMessageDialog
        title={t('send-message-dialog.direct-message-title')}
        open={isContactDialogVisible}
        onClose={() => setContactDialogVisible(false)}
        onSendMessage={handleSendMessage}
        messageReceivers={
          author && [
            {
              id: author.id,
              displayName: author.displayName,
              avatarUri: author.avatarUrl,
              city: author.city,
              country: author.country,
            },
          ]
        }
      />
    </>
  );
};

export default AuthorAvatar;
