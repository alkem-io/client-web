import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { UserConversation } from './useUserConversations';
import { ConversationMessage } from './useConversationMessages';
import { useSendMessageToRoomMutation, useMarkMessageAsReadMutation } from '@/core/apollo/generated/apollo-hooks';
import { useRef, useEffect, useCallback, useLayoutEffect, useState } from 'react';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';
import CommentReactions from '@/domain/communication/room/Comments/CommentReactions';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';

interface MessageBubbleProps {
  message: ConversationMessage;
  isOwnMessage: boolean;
  canAddReaction: boolean;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
}

const MessageBubble = ({
  message,
  isOwnMessage,
  canAddReaction,
  onAddReaction,
  onRemoveReaction,
}: MessageBubbleProps) => {
  const { t } = useTranslation();
  const hasReactions = message.reactions.length > 0;
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(hasReactions);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const shouldShowAddButton = hasReactions || isAddButtonVisible || isReactionPickerOpen || isHovering;

  const showInlineReactions = hasReactions;
  const showOverlayAddButton = !showInlineReactions && canAddReaction && shouldShowAddButton;

  useEffect(() => {
    setIsAddButtonVisible(hasReactions || isReactionPickerOpen);
  }, [hasReactions, isReactionPickerOpen]);

  const handleShowAddReaction = () => {
    if (!hasReactions) {
      setIsAddButtonVisible(true);
    }
    setIsHovering(true);
  };

  const handleHideAddReaction = () => {
    if (!hasReactions && !isReactionPickerOpen) {
      setIsAddButtonVisible(false);
    }
    setIsHovering(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={isOwnMessage ? 'flex-end' : 'flex-start'}
      gap={gutters(0.25)}
      marginY={gutters(0.5)}
      onMouseEnter={handleShowAddReaction}
      onMouseLeave={handleHideAddReaction}
      onClick={handleShowAddReaction}
    >
      <Box
        display="flex"
        flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
        alignItems="flex-start"
        gap={gutters(0.5)}
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
            backgroundColor: isOwnMessage ? 'primary.main' : 'background.default',
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
            borderRadius: theme => `${theme.shape.borderRadius}px`,
            padding: gutters(0.5),
            paddingX: gutters(),
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          <Box display="inline-flex" alignItems="baseline" gap={gutters(0.5)} flexWrap="wrap" sx={{ width: '100%' }}>
            <WrapperMarkdown
              sx={{
                display: 'inline',
                '& p': { margin: 0 },
                wordBreak: 'break-word',
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
                color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'neutral.light',
                whiteSpace: 'nowrap',
              }}
            >
              {formatTimeElapsed(new Date(message.timestamp), t)}
            </Caption>
          </Box>
          {showOverlayAddButton && (
            <Box
              sx={{
                position: 'absolute',
                top: gutters(0.25),
                right: gutters(-0.25),
                transform: 'translateY(-60%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.paper',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
              onMouseEnter={handleShowAddReaction}
              onMouseLeave={handleHideAddReaction}
            >
              <CommentReactions
                reactions={[]}
                canAddReaction={canAddReaction}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
                showAddButton
                onPickerVisibilityChange={setIsReactionPickerOpen}
              />
            </Box>
          )}
        </Box>
      </Box>

      {(showInlineReactions || (canAddReaction && shouldShowAddButton && !showOverlayAddButton)) && (
        <Box
          marginLeft={isOwnMessage ? 0 : gutters(2.5)}
          marginRight={isOwnMessage ? gutters(0.5) : 0}
          display="flex"
          alignItems="center"
        >
          <CommentReactions
            reactions={message.reactions}
            canAddReaction={canAddReaction}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            showAddButton
            onPickerVisibilityChange={setIsReactionPickerOpen}
          />
        </Box>
      )}
    </Box>
  );
};

interface UserMessagingConversationViewProps {
  conversation: UserConversation | null;
  messages: ConversationMessage[];
  messagesLoading: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const UserMessagingConversationView = ({
  conversation,
  messages,
  messagesLoading,
  onBack,
  showBackButton = false,
}: UserMessagingConversationViewProps) => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sendMessage, { loading: isSending }] = useSendMessageToRoomMutation();
  const { addReaction, removeReaction } = useCommentReactionsMutations(conversation?.roomId);
  useSubscribeOnRoomEvents(conversation?.roomId, !conversation);
  const [markAsRead] = useMarkMessageAsReadMutation();

  // Mark last message as read when conversation is opened or new messages arrive
  const markConversationAsRead = useCallback(() => {
    if (!conversation?.roomId || !messages.length || conversation.unreadCount === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    markAsRead({
      variables: {
        messageData: {
          roomID: conversation.roomId,
          messageID: lastMessage.id,
        },
      },
    }).catch(error => {
      console.error('Failed to mark messages as read:', error);
    });
  }, [conversation?.roomId, conversation?.unreadCount, messages, markAsRead]);

  // Mark as read when conversation is opened
  useEffect(() => {
    markConversationAsRead();
  }, [markConversationAsRead]);

  // Scroll to bottom when messages change
  useLayoutEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages.length, conversation?.roomId]);

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
      return true; // Return true to reset the form
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  const handleAddReaction = (messageId: string) => (emoji: string) => {
    if (!conversation?.roomId) {
      return;
    }
    return addReaction({ emoji, messageId });
  };

  const handleRemoveReaction = (reactionId: string) => {
    if (!conversation?.roomId) {
      return;
    }
    return removeReaction(reactionId);
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
        {messagesLoading ? (
          <Gutters alignItems="center" justifyContent="center" flex={1}>
            <Loading />
          </Gutters>
        ) : messages.length === 0 ? (
          <Gutters alignItems="center" justifyContent="center" flex={1}>
            <Caption>{t('components.userMessaging.noMessages' as const)}</Caption>
          </Gutters>
        ) : (
          messages.map(message => {
            const isOwnMessage = message.sender?.id === userModel?.id;
            const canAddReaction = Boolean(conversation.roomId && message.message);

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                canAddReaction={canAddReaction}
                onAddReaction={handleAddReaction(message.id)}
                onRemoveReaction={handleRemoveReaction}
              />
            );
          })
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
