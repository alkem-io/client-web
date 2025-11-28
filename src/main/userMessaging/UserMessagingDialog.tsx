import { DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useUserMessagingContext } from './UserMessagingContext';
import { useUserConversations } from './useUserConversations';
import { UserMessagingChatList } from './UserMessagingChatList';
import { UserMessagingConversationView } from './UserMessagingConversationView';
import { NewMessageDialog } from './NewMessageDialog';
import { useScreenSize } from '@/core/ui/grid/constants';
import { useMemo, useCallback, useState, useEffect } from 'react';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';

const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

export const UserMessagingDialog = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen, selectedConversationId, setSelectedConversationId } = useUserMessagingContext();
  const { conversations, isLoading, refetch } = useUserConversations();
  const { isSmallScreen: isMobile } = useScreenSize();
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);

  // Poll for new messages when dialog is open and a conversation is selected
  useEffect(() => {
    if (!isOpen || !selectedConversationId) {
      return;
    }

    const intervalId = setInterval(() => {
      refetch().catch(error => {
        // in case of an error, stop polling
        console.log('Failed to poll for new messages: ', error);
        clearInterval(intervalId);
      });
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen, selectedConversationId, refetch]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find(c => c.id === selectedConversationId) ?? null;
  }, [conversations, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMessageSent = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOpenNewMessage = () => {
    setIsNewMessageDialogOpen(true);
  };

  const handleCloseNewMessage = () => {
    setIsNewMessageDialogOpen(false);
  };

  const handleNewMessageSent = useCallback(
    async (userId: string) => {
      // Refetch conversations to get the new conversation
      const result = await refetch();

      // Find the conversation with this user and select it
      const newConversation = result.data?.me?.conversations?.users?.find(conv => conv.user?.id === userId);

      if (newConversation) {
        setSelectedConversationId(newConversation.id);
      }
    },
    [refetch, setSelectedConversationId]
  );

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
          <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedConversationId ? (
              <UserMessagingConversationView
                conversation={selectedConversation}
                onBack={handleBack}
                showBackButton
                onMessageSent={handleMessageSent}
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
          onMessageSent={handleNewMessageSent}
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
        <DialogContent sx={{ padding: 0, display: 'flex', minHeight: 500 }}>
          <PageContentBlockSeamless
            disablePadding
            columns={3}
            sx={{
              borderRight: theme => `1px solid ${theme.palette.divider}`,
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
          <PageContentBlockSeamless disablePadding disableGap columns={5} sx={{ flexGrow: 1 }}>
            <UserMessagingConversationView conversation={selectedConversation} onMessageSent={handleMessageSent} />
          </PageContentBlockSeamless>
        </DialogContent>
      </DialogWithGrid>
      <NewMessageDialog
        open={isNewMessageDialogOpen}
        onClose={handleCloseNewMessage}
        onMessageSent={handleNewMessageSent}
      />
    </>
  );
};
