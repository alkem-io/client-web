import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import Gutters from '@/core/ui/grid/Gutters';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { UserConversation, UserConversationMessage } from './useUserConversations';
import { useSendMessageToRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { useRef, useEffect } from 'react';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';

interface MessageBubbleProps {
  message: UserConversationMessage;
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      gap={gutters(0.5)}
      marginY={gutters(0.5)}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender?.avatarUri}
          alt={message.sender?.displayName ?? ''}
          size="medium"
          sx={{ boxShadow: '0 0px 2px rgba(0, 0, 0, 0.2)' }}
        />
      )}
      <Box
        sx={{
          maxWidth: '70%',
          backgroundColor: isOwnMessage ? 'primary.main' : 'background.default',
          color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
          borderRadius: theme => `${theme.shape.borderRadius}px`,
          padding: gutters(0.5),
          paddingX: gutters(),
          display: 'flex',
          alignItems: 'flex-end',
          gap: gutters(0.5),
        }}
      >
        <WrapperMarkdown
          sx={{
            '& p': { margin: 0 },
            flex: 1,
            ...(isOwnMessage && {
              '& a': {
                color: 'inherit',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              },
            }),
          }}
        >
          {message.message}
        </WrapperMarkdown>
        <Caption
          sx={{
            color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'neutral.light',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {formatTimeElapsed(new Date(message.timestamp), t)}
        </Caption>
      </Box>
    </Box>
  );
};

interface UserMessagingConversationViewProps {
  conversation: UserConversation | null;
  onBack?: () => void;
  showBackButton?: boolean;
  onMessageSent?: () => void;
}

export const UserMessagingConversationView = ({
  conversation,
  onBack,
  showBackButton = false,
  onMessageSent,
}: UserMessagingConversationViewProps) => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sendMessage, { loading: isSending }] = useSendMessageToRoomMutation();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  const handleSendMessage = async (message: string) => {
    if (!conversation?.roomId || !message.trim()) {
      return;
    }

    try {
      await sendMessage({
        variables: {
          messageData: {
            roomID: conversation.roomId,
            message: message.trim(),
          },
        },
      });
      onMessageSent?.();
      return true; // Return true to reset the form
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  if (!conversation) {
    return (
      <Gutters alignItems="center" justifyContent="center" height="100%">
        <Typography variant="body1" color="neutral.main">
          {t('components.userMessaging.selectConversation' as const)}
        </Typography>
      </Gutters>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={gutters(0.5)}
        padding={gutters(0.5)}
        paddingX={gutters()}
        borderBottom={theme => `1px solid ${theme.palette.divider}`}
        sx={{ backgroundColor: 'background.paper', height: 80 }}
      >
        {showBackButton && (
          <IconButton onClick={onBack} size="small" aria-label={t('buttons.back')}>
            <ArrowBack />
          </IconButton>
        )}
        <Avatar
          src={conversation.user.avatarUri}
          alt={conversation.user.displayName}
          size="medium"
          sx={{ boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)' }}
        />
        <Typography variant="h4" fontWeight={500}>
          {conversation.user.displayName}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        flex={1}
        overflow="auto"
        paddingX={gutters()}
        paddingY={gutters(0.5)}
        display="flex"
        flexDirection="column"
        sx={{ boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.15) inset' }}
      >
        {conversation.messages.length === 0 ? (
          <Gutters alignItems="center" justifyContent="center" flex={1}>
            <Caption>{t('components.userMessaging.noMessages' as const)}</Caption>
          </Gutters>
        ) : (
          conversation.messages.map(message => (
            <MessageBubble key={message.id} message={message} isOwnMessage={message.sender?.id === userModel?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        padding={gutters()}
        borderTop={theme => `1px solid ${theme.palette.divider}`}
        sx={{
          backgroundColor: '#F1F4F5',
          boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.15) inset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PostMessageToCommentsForm
          sx={{ width: '100%', marginBottom: '-20px' }}
          onPostComment={handleSendMessage}
          placeholder={t('components.userMessaging.typeMessage' as const)}
          disabled={isSending}
        />
      </Box>
    </Box>
  );
};
