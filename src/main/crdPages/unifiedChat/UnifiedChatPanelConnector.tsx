import { formatDistanceToNowStrict } from 'date-fns';
import { Info, Trash2, Users } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatConversationList } from '@/crd/components/chat/ChatConversationList';
import { ChatPanel } from '@/crd/components/chat/ChatPanel';
import { ChatThreadView } from '@/crd/components/chat/ChatThreadView';
import { GroupAvatar } from '@/crd/components/chat/GroupAvatar';
import { GroupSettingsDialog } from '@/crd/components/chat/GroupSettingsDialog';
import { GuidanceInfoDialog } from '@/crd/components/chat/GuidanceInfoDialog';
import { NewChatDialog } from '@/crd/components/chat/NewChatDialog';
import type { ChatThreadHeader } from '@/crd/components/chat/types';
import type { CommentAuthor } from '@/crd/components/comment/types';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useConversationEventsSubscription } from '@/main/userMessaging/useConversationEventsSubscription';
import { useConversationMessages } from '@/main/userMessaging/useConversationMessages';
import {
  injectGuidanceIntro,
  mapConversationToListItem,
  mapMembersToGroupMembers,
  mapMemberToCommentAuthor,
  mapMessageToChatMessage,
} from './dataMapper';
import { useUnifiedChatContext } from './UnifiedChatProvider';
import { useGroupSettings } from './useGroupSettings';
import { useNewChat } from './useNewChat';
import { useUnifiedConversations } from './useUnifiedConversations';
import { useUnifiedConversationView } from './useUnifiedConversationView';

/**
 * Wires the unified conversation list + selected thread to the CRD ChatPanel.
 * Owns list/thread selection, realtime, send + reactions, and Guidance behaviors.
 */
export const UnifiedChatPanelConnector = () => {
  const { t, i18n } = useTranslation('crd-chat');
  const { userModel } = useCurrentUserContext();
  const currentUserId = userModel?.id;

  const {
    isOpen,
    setIsOpen,
    selectedConversationId,
    selectedRoomId,
    setSelectedConversationId,
    setSelectedRoomId,
    setNewlyCreatedConversationId,
  } = useUserMessagingContext();
  const { guidanceVcId } = useUnifiedChatContext();

  const newChat = useNewChat((conversationId, roomId) => {
    setNewlyCreatedConversationId(conversationId);
    setSelectedConversationId(conversationId);
    setSelectedRoomId(roomId);
  });

  const { conversations, isLoading } = useUnifiedConversations();
  const { messages: rawMessages, isLoading: messagesLoading } = useConversationMessages(selectedConversationId);

  const selectedConversation = conversations.find(conversation => conversation.id === selectedConversationId);
  const isGuidanceThread = selectedConversation?.isGuidance ?? false;

  // Realtime: global conversation events + the selected room's stream (inside the view hook).
  useConversationEventsSubscription(selectedRoomId);
  const {
    isSending,
    handleSendMessage,
    handleAddReaction,
    handleRemoveReaction,
    handleLeaveGroup,
    isAwaitingGuidanceResponse,
    clearGuidance,
  } = useUnifiedConversationView(selectedConversation ?? null, rawMessages, currentUserId);

  const groupSettings = useGroupSettings(selectedConversation?.id, selectedConversation?.members ?? []);

  const [infoOpen, setInfoOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const justClearedRef = useRef(false);

  // The guidance conversation id can change after a clear; re-point the open
  // thread to the (possibly new) guidance conversation once the refetch lands.
  const guidanceConversation = conversations.find(conversation => conversation.isGuidance);
  useEffect(() => {
    if (justClearedRef.current && guidanceConversation && guidanceConversation.id !== selectedConversationId) {
      justClearedRef.current = false;
      setSelectedConversationId(guidanceConversation.id);
      setSelectedRoomId(guidanceConversation.roomId);
    }
  }, [guidanceConversation, selectedConversationId, setSelectedConversationId, setSelectedRoomId]);

  const locale = resolveDateFnsLocale(i18n.language);
  const formatTimestamp = (timestampMs: number) =>
    formatDistanceToNowStrict(new Date(timestampMs), { addSuffix: true, locale });

  const listItems = conversations.map(conversation =>
    mapConversationToListItem(conversation, { currentUserId, formatTimestamp })
  );

  const view = selectedConversationId ? 'thread' : 'list';

  const threadHeader: ChatThreadHeader | undefined = selectedConversation
    ? {
        id: selectedConversation.id,
        displayName: selectedConversation.displayName ?? '',
        avatarUrl: selectedConversation.avatarUri,
        isGroup: selectedConversation.isGroup,
        isGuidance: selectedConversation.isGuidance,
        memberCount: selectedConversation.members.length,
      }
    : undefined;

  let chatMessages = rawMessages.map(message => mapMessageToChatMessage(message, { currentUserId, formatTimestamp }));
  if (isGuidanceThread && selectedConversation) {
    const vcMember = selectedConversation.members.find(member => member.id === guidanceVcId);
    const author: CommentAuthor = vcMember
      ? mapMemberToCommentAuthor(vcMember)
      : { id: guidanceVcId ?? 'guidance', name: selectedConversation.displayName ?? '', isVirtualContributor: true };
    chatMessages = injectGuidanceIntro(chatMessages, { text: t('guidance.intro'), author });
  }

  const currentUser: CommentAuthor | undefined = userModel?.id
    ? { id: userModel.id, name: userModel.profile?.displayName ?? '', avatarUrl: userModel.profile?.avatar?.uri }
    : undefined;

  const handleSelect = (id: string) => {
    setSelectedConversationId(id);
    const conversation = conversations.find(item => item.id === id);
    setSelectedRoomId(conversation?.roomId ?? null);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSelectedRoomId(null);
  };

  const onAddReaction = (messageId: string, emoji: string) => {
    handleAddReaction(messageId)(emoji);
  };

  // CommentReactions toggles by emoji; resolve the current user's reaction id for removal.
  const onRemoveReaction = (messageId: string, emoji: string) => {
    const raw = rawMessages.find(message => message.id === messageId);
    const reaction = raw?.reactions.find(item => item.emoji === emoji && item.sender?.id === currentUserId);
    if (reaction) {
      handleRemoveReaction(reaction.id);
    }
  };

  const handleClearGuidance = async () => {
    if (!selectedConversationId) {
      return;
    }
    setClearing(true);
    try {
      await clearGuidance(selectedConversationId);
      justClearedRef.current = true;
    } finally {
      setClearing(false);
      setClearConfirmOpen(false);
    }
  };

  const iconButtonClass =
    'flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  let headerActions: ReactNode;
  if (isGuidanceThread) {
    headerActions = (
      <>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label={t('guidance.infoButton')}
          className={iconButtonClass}
        >
          <Info aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setClearConfirmOpen(true)}
          aria-label={t('guidance.clear')}
          className={iconButtonClass}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </>
    );
  } else if (selectedConversation?.isGroup) {
    headerActions = (
      <button
        type="button"
        onClick={groupSettings.openDialog}
        aria-label={t('group.settings')}
        className={iconButtonClass}
      >
        <Users aria-hidden="true" className="size-4" />
      </button>
    );
  }

  const groupMembers = selectedConversation
    ? mapMembersToGroupMembers(selectedConversation.members, currentUserId)
    : [];

  const handleLeaveGroupConfirmed = async () => {
    await handleLeaveGroup();
    groupSettings.onOpenChange(false);
    handleBack();
  };

  return (
    <>
      <ChatPanel
        open={isOpen}
        title={view === 'thread' ? (threadHeader?.displayName ?? '') : t('panel.title')}
        onClose={() => setIsOpen(false)}
        closeLabel={t('launcher.close')}
        onBack={view === 'thread' ? handleBack : undefined}
        backLabel={t('thread.back')}
        headerActions={view === 'thread' ? headerActions : undefined}
      >
        {view === 'thread' ? (
          <ChatThreadView
            conversation={threadHeader}
            messages={chatMessages}
            messagesLoading={messagesLoading}
            currentUser={currentUser}
            isSending={isSending}
            // No reactions on the AI assistant thread (incl. the synthetic intro) — FR-016a.
            canReact={Boolean(selectedConversation) && !isGuidanceThread}
            isAwaitingGuidanceResponse={isAwaitingGuidanceResponse}
            onSendMessage={message => {
              handleSendMessage(message);
            }}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
          />
        ) : (
          <ChatConversationList
            conversations={listItems}
            selectedConversationId={selectedConversationId ?? undefined}
            isLoading={isLoading}
            onSelectConversation={handleSelect}
            onNewMessage={newChat.openDialog}
          />
        )}
      </ChatPanel>

      <NewChatDialog
        open={newChat.open}
        onOpenChange={newChat.onOpenChange}
        searchQuery={newChat.searchQuery}
        onSearchChange={newChat.onSearchChange}
        searchResults={newChat.searchResults}
        selectedUsers={newChat.selectedUsers}
        onSelect={newChat.onSelect}
        onRemove={newChat.onRemove}
        loading={newChat.loading}
        creating={newChat.creating}
        onCreate={newChat.create}
      />
      <GroupSettingsDialog
        open={groupSettings.open}
        onOpenChange={groupSettings.onOpenChange}
        displayName={selectedConversation?.displayName ?? ''}
        members={groupMembers}
        avatarSlot={
          <GroupAvatar
            members={groupMembers.map(m => ({ id: m.id, name: m.name, avatarUrl: m.avatarUrl }))}
            size="lg"
          />
        }
        searchQuery={groupSettings.searchQuery}
        onSearchChange={groupSettings.onSearchChange}
        searchResults={groupSettings.searchResults}
        loadingSearch={groupSettings.loading}
        onAddMember={groupSettings.onAddMember}
        onRemoveMember={groupSettings.onRemoveMember}
        onLeaveGroup={handleLeaveGroupConfirmed}
        onSave={groupSettings.onSave}
        saving={groupSettings.saving}
      />
      <GuidanceInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
      <ConfirmationDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title={t('guidance.clearConfirm.title')}
        description={t('guidance.clearConfirm.description')}
        confirmLabel={t('guidance.clearConfirm.confirm')}
        variant="destructive"
        loading={clearing}
        onConfirm={handleClearGuidance}
      />
    </>
  );
};
