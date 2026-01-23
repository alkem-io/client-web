import { DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useUserMessagingContext } from './UserMessagingContext';
import { useUserConversations } from './useUserConversations';
import { useConversationMessages } from './useConversationMessages';
import { useConversationEventsSubscription } from './useConversationEventsSubscription';
import { UserMessagingChatList } from './UserMessagingChatList';
import { UserMessagingConversationView } from './UserMessagingConversationView';
import { NewMessageDialog } from './NewMessageDialog';
import { useScreenSize } from '@/core/ui/grid/constants';
import { useState, useEffect } from 'react';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';

const UserMessagingDialog = () => {
  const { t } = useTranslation();
  const {
    isOpen,
    setIsOpen,
    selectedConversationId,
    setSelectedConversationId,
    selectedRoomId,
    setSelectedRoomId,
    setTotalUnreadCount,
  } = useUserMessagingContext();

  // Query for conversation list (light - no messages)
  const { conversations, totalUnreadCount, isLoading } = useUserConversations();

  // Query for messages of selected conversation (on demand)
  const { messages, isLoading: messagesLoading } = useConversationMessages(selectedConversationId);

  const { isSmallScreen: isMobile } = useScreenSize();
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);

  // Sync total unread count to context (for button badge)
  useEffect(() => {
    setTotalUnreadCount(totalUnreadCount);
  }, [totalUnreadCount, setTotalUnreadCount]);

  // Subscribe to conversation events (new messages, new conversations, read receipts)
  useConversationEventsSubscription(selectedRoomId);

  // Subscribe to room events for the selected conversation (live updates while viewing)
  useSubscribeOnRoomEvents(selectedRoomId ?? undefined, !isOpen);

  // Get the selected conversation for display
  const selectedConversation = selectedConversationId
    ? (conversations.find(c => c.id === selectedConversationId) ?? null)
    : null;

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversationId(conversationId);
    setSelectedRoomId(conversation?.roomId ?? null);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSelectedRoomId(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenNewMessage = () => {
    setIsNewMessageDialogOpen(true);
  };

  const handleCloseNewMessage = () => {
    setIsNewMessageDialogOpen(false);
  };

  const handleNewMessageSent = async (userId: string) => {
    // Find the conversation with this user and select it
    // The subscription will handle adding new conversations, but we can also check if it exists
    const existingConversation = conversations.find(conv => conv.user?.id === userId);

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      setSelectedRoomId(existingConversation.roomId);
    }
    // If not found, the conversationCreated event from subscription will add it
  };

  // Mobile view: show either the list or the conversation
  if (isMobile) {
    return (
      <>
        <DialogWithGrid
          open={isOpen}
          columns={12}
          fullScreen
          onClose={handleClose}
          aria-labelledby={t('components.userMessaging.title' as const)}
          sx={{
            '.MuiDialog-container': {
              alignItems: 'stretch',
            },
            '.MuiDialog-paper': {
              height: '100vh',
            },
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            aria-label={t('buttons.close')}
            sx={theme => ({
              position: 'absolute',
              top: theme.spacing(2),
              right: theme.spacing(2),
              zIndex: 1,
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
          >
            {selectedConversationId ? (
              <UserMessagingConversationView
                conversation={selectedConversation}
                messages={messages}
                messagesLoading={messagesLoading}
                onBack={handleBack}
                showBackButton
              />
            ) : (
              <UserMessagingChatList
                conversations={conversations}
                isLoading={isLoading}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewMessage={handleOpenNewMessage}
              />
            )}
          </DialogContent>
        </DialogWithGrid>
        <NewMessageDialog
          open={isNewMessageDialogOpen}
          onClose={handleCloseNewMessage}
          onConversationCreated={handleNewMessageSent}
        />
      </>
    );
  }

  // Desktop view: split layout
  return (
    <>
      <DialogWithGrid
        open={isOpen}
        columns={8}
        fullHeight
        maxWidth={false}
        onClose={handleClose}
        aria-labelledby={t('components.userMessaging.title' as const)}
        sx={{
          '.MuiDialog-container': {
            alignItems: 'stretch',
          },
          '.MuiDialog-paper': {
            height: '100%',
          },
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          aria-label={t('buttons.close')}
          sx={theme => ({
            position: 'absolute',
            top: theme.spacing(2),
            right: theme.spacing(2),
            zIndex: 1,
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ padding: 0, display: 'flex', height: '100%' }}>
          <PageContentBlockSeamless
            disablePadding
            columns={3}
            sx={{
              borderRight: theme => `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <UserMessagingChatList
              conversations={conversations}
              isLoading={isLoading}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onNewMessage={handleOpenNewMessage}
            />
          </PageContentBlockSeamless>
          <PageContentBlockSeamless disablePadding disableGap columns={5} sx={{ flexGrow: 1, height: '100%' }}>
            <UserMessagingConversationView
              conversation={selectedConversation}
              messages={messages}
              messagesLoading={messagesLoading}
            />
          </PageContentBlockSeamless>
        </DialogContent>
      </DialogWithGrid>
      <NewMessageDialog
        open={isNewMessageDialogOpen}
        onClose={handleCloseNewMessage}
        onConversationCreated={handleNewMessageSent}
      />
    </>
  );
};

export default UserMessagingDialog;
