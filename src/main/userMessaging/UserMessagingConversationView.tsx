import { ArrowBack, Close, Groups, MoreVert, Remove } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useLeaveConversationMutation,
  useMarkMessageAsReadMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import Avatar from '@/core/ui/avatar/Avatar';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import CommentReactions from '@/domain/communication/room/Comments/CommentReactions';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { GroupChatManagementDialog } from './GroupChatManagementDialog';
import { GroupCompositeAvatar } from './GroupCompositeAvatar';
import type { ConversationMessage } from './useConversationMessages';
import type { UserConversation } from './useUserConversations';

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
                showAddButton={true}
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
            showAddButton={true}
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
  onLeaveConversation?: () => void;
  onClose?: () => void;
}

export const UserMessagingConversationView = ({
  conversation,
  messages,
  messagesLoading,
  onBack,
  showBackButton = false,
  onLeaveConversation,
  onClose,
}: UserMessagingConversationViewProps) => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [leaveConversation] = useLeaveConversationMutation();

  const isGroup = conversation?.isGroup ?? false;

  const handleLeaveGroup = async () => {
    if (!conversation) return;
    // Fire-and-forget: the subscription (MEMBER_REMOVED / CONVERSATION_DELETED) handles cache removal
    await leaveConversation({
      variables: { leaveData: { conversationID: conversation.id } },
    });
    setIsLeaveConfirmOpen(false);
    onLeaveConversation?.();
  };

  const [sendMessage, { loading: isSending }] = useSendMessageToRoomMutation();
  const { addReaction, removeReaction } = useCommentReactionsMutations(conversation?.roomId);
  useSubscribeOnRoomEvents(conversation?.roomId, !conversation);
  const [markAsRead] = useMarkMessageAsReadMutation();
  const lastMarkedRef = useRef<string | null>(null);

  // Send read receipt to Matrix when messages are available
  useEffect(() => {
    if (!conversation?.roomId || !messages.length) return;

    const lastMessage = messages[messages.length - 1];
    const key = `${conversation.roomId}:${lastMessage.id}`;

    // Skip if we already marked this exact message as read
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    const roomId = conversation.roomId;
    markAsRead({
      variables: {
        messageData: {
          roomID: roomId,
          messageID: lastMessage.id,
        },
      },
      // Server confirmed the read receipt — update the cache directly.
      // The refetch would race Matrix and return stale counts.
      update: cache => {
        const roomCacheId = cache.identify({ __typename: 'Room', id: roomId });
        if (roomCacheId) {
          cache.modify({
            id: roomCacheId,
            fields: {
              unreadCount: () => 0,
            },
          });
        }
      },
    }).catch(_error => {});
  }, [conversation?.roomId, messages, markAsRead]);

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
    } catch (_error) {
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
      <Box display="flex" flexDirection="column" height="100%">
        {onClose && (
          <Box display="flex" justifyContent="flex-end" padding={gutters(0.5)} paddingX={gutters()}>
            <IconButton size="small" onClick={onClose} aria-label={t('buttons.close')}>
              <Close />
            </IconButton>
          </Box>
        )}
        <Gutters alignItems="center" justifyContent="center" flex={1}>
          <Typography variant="body1" color="neutral.main">
            {t('components.userMessaging.selectConversation' as const)}
          </Typography>
        </Gutters>
      </Box>
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
        {isGroup && !conversation.avatarUri ? (
          <GroupCompositeAvatar
            members={conversation.members}
            size="medium"
            sx={{ boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)' }}
          />
        ) : (
          <Avatar
            src={conversation.avatarUri}
            alt={conversation.displayName ?? conversation.members.map(m => m.displayName).join(', ')}
            size="medium"
            sx={{ boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)' }}
          />
        )}
        <Box>
          <Typography variant="h4" fontWeight={500}>
            {conversation.displayName ?? conversation.members.map(m => m.displayName).join(', ')}
          </Typography>
          {isGroup && (
            <Caption color="neutral.light">
              {t('components.userMessaging.membersCount' as const, { count: conversation.members.length })}
            </Caption>
          )}
        </Box>
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isGroup && (
            <>
              <IconButton
                size="small"
                onClick={e => setMenuAnchorEl(e.currentTarget)}
                aria-label={t('components.userMessaging.manageGroup' as const)}
              >
                <MoreVert />
              </IconButton>
              <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
                <MenuItem
                  onClick={() => {
                    setMenuAnchorEl(null);
                    setIsManageDialogOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <Groups fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('components.userMessaging.manageGroup' as const)}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuAnchorEl(null);
                    setIsLeaveConfirmOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <Remove fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('components.userMessaging.leaveGroup' as const)}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label={t('buttons.close')}>
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Group management dialog */}
      {isGroup && (
        <GroupChatManagementDialog
          key={conversation.id}
          open={isManageDialogOpen}
          onClose={() => setIsManageDialogOpen(false)}
          conversationId={conversation.id}
          currentMembers={conversation.members}
          displayName={conversation.roomDisplayName}
          avatarUrl={conversation.avatarUri}
          onLeaveGroup={() => {
            setIsManageDialogOpen(false);
            setIsLeaveConfirmOpen(true);
          }}
        />
      )}

      {/* Leave confirmation dialog */}
      <Dialog
        open={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        aria-labelledby="leave-confirm-title"
      >
        <DialogHeader
          id="leave-confirm-title"
          title={t('components.userMessaging.leaveGroupConfirmTitle' as const)}
          onClose={() => setIsLeaveConfirmOpen(false)}
        />
        <DialogContent>
          <Typography>{t('components.userMessaging.leaveGroupConfirmMessage' as const)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLeaveConfirmOpen(false)}>{t('buttons.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleLeaveGroup}>
            {t('components.userMessaging.leaveGroup' as const)}
          </Button>
        </DialogActions>
      </Dialog>

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
