import CloseIcon from '@mui/icons-material/Close';
import { DialogContent, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useScreenSize } from '@/core/ui/grid/constants';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { NewMessageDialog } from './NewMessageDialog';
import { UserMessagingChatList } from './UserMessagingChatList';
import { useUserMessagingContext } from './UserMessagingContext';
import { UserMessagingConversationView } from './UserMessagingConversationView';
import { useConversationEventsSubscription } from './useConversationEventsSubscription';
import { useConversationMessages } from './useConversationMessages';
import { useUnreadConversationsCount } from './useUnreadConversationsCount';
import { useUserConversations } from './useUserConversations';

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
    setNewlyCreatedConversationId,
  } = useUserMessagingContext();

  // Lightweight query for badge count on app load (no messages, no user profiles)
  const initialUnreadCount = useUnreadConversationsCount();

  // Full query for conversation list (only when dialog is open)
  const { conversations, totalUnreadCount, isLoading } = useUserConversations();

  // Query for messages of selected conversation (on demand)
  const { messages, isLoading: messagesLoading } = useConversationMessages(selectedConversationId);

  const { isSmallScreen: isMobile } = useScreenSize();
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);

  // Sync unread count to context: use full query count when dialog is open, lightweight count otherwise
  useEffect(() => {
    setTotalUnreadCount(isOpen ? totalUnreadCount : initialUnreadCount);
  }, [isOpen, totalUnreadCount, initialUnreadCount, setTotalUnreadCount]);

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

  const handleNewConvMessageSent = (conversationId: string, roomId: string) => {
    // Track the newly created conversation so it appears at the top of the list
    setNewlyCreatedConversationId(conversationId);

    // Select immediately — the subscription will add the conversation to the cache
    // and selectedConversation will resolve on the next render
    setSelectedConversationId(conversationId);
    setSelectedRoomId(roomId);
  };

  // Mobile view: show either the list or the conversation
  if (isMobile) {
    return (
      <>
        <DialogWithGrid
          open={isOpen}
          columns={12}
          fullScreen={true}
          onClose={handleClose}
          aria-labelledby={t('components.userMessaging.title' as const)}
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
                showBackButton={true}
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
          onConversationCreated={handleNewConvMessageSent}
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
        fullHeight={true}
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
            disablePadding={true}
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
          <PageContentBlockSeamless
            disablePadding={true}
            disableGap={true}
            columns={5}
            sx={{ flexGrow: 1, height: '100%' }}
          >
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
        onConversationCreated={handleNewConvMessageSent}
      />
    </>
  );
};

export default UserMessagingDialog;
