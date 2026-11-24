import { formatDistanceToNowStrict } from 'date-fns';
import { Info, Loader2, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { rotateActiveSessionIfDue } from '@/core/matrix/activeSession';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ActiveCallIndicator } from '@/crd/components/chat/ActiveCallIndicator';
import { CallControls, chatHeaderIconButtonClass, chatHeaderIconClass } from '@/crd/components/chat/CallControls';
import { ChatConnectionNotice } from '@/crd/components/chat/ChatConnectionNotice';
import { ChatConversationList } from '@/crd/components/chat/ChatConversationList';
import { ChatOptionsMenu } from '@/crd/components/chat/ChatOptionsMenu';
import { ChatPanel } from '@/crd/components/chat/ChatPanel';
import { ChatSettingsMenu } from '@/crd/components/chat/ChatSettingsMenu';
import { ConversationAvatar } from '@/crd/components/chat/ConversationAvatar';
import { GroupAvatar } from '@/crd/components/chat/GroupAvatar';
import { GroupSettingsDialog } from '@/crd/components/chat/GroupSettingsDialog';
import { GuidanceInfoDialog } from '@/crd/components/chat/GuidanceInfoDialog';
import { NewChatDialog } from '@/crd/components/chat/NewChatDialog';
import { SetStatusDialog } from '@/crd/components/chat/SetStatusDialog';
import type { ChatThreadHeader } from '@/crd/components/chat/types';
import { UserPresencePopover } from '@/crd/components/chat/UserPresencePopover';
import type { CommentAuthor } from '@/crd/components/comment/types';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { Avatar, AvatarImage } from '@/crd/primitives/avatar';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildUserNotificationSettingsUrl } from '@/main/routing/urlBuilders';
import { useConversationDrafts } from '@/main/userMessaging/ConversationDraftsContext';
import { openCall } from '@/main/userMessaging/calls/callOverlayStore';
import { useActiveCallRooms } from '@/main/userMessaging/calls/useActiveCallRooms';
import { useCallEligibility } from '@/main/userMessaging/calls/useCallEligibility';
import { useRoomCallSession } from '@/main/userMessaging/calls/useRoomCallSession';
import { type CallAction, type CallMedia, callIntentFor } from '@/main/userMessaging/calls/widgetUrl';
import { storeFor } from '@/main/userMessaging/matrix/conversationSummaryStore';
import { useOwnStatusMessage } from '@/main/userMessaging/matrix/useMatrixPresence';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useChatSound } from '@/main/userMessaging/useChatSound';
import { useConversationMessages } from '@/main/userMessaging/useConversationMessages';
import { ConversationThread } from './ConversationThread';
import { resolveChatLocale } from './chatLocale';
import {
  injectGuidanceIntro,
  mapConversationToListItem,
  mapMembersToGroupMembers,
  mapMemberToCommentAuthor,
  mapMessageToChatMessage,
  withActiveCallsFirst,
} from './dataMapper';
import { useUnifiedChatContext } from './UnifiedChatProvider';
import { useChatDeepLinkSelect } from './useChatDeepLink';
import { useGroupSettings } from './useGroupSettings';
import { useGuidanceResponseState } from './useGuidanceResponseState';
import { useNewChat } from './useNewChat';
import { useUnifiedConversations } from './useUnifiedConversations';
import { useUnifiedConversationView } from './useUnifiedConversationView';

// How long after the click a queued call may still open.
const QUEUED_CALL_TIMEOUT_MS = 10_000;
// How long the "try again" notice of a dropped call stays.
const DROPPED_CALL_NOTICE_MS = 8_000;

/**
 * Wires the unified conversation list + selected thread to the CRD ChatPanel.
 * Owns list/thread selection, realtime, send + reactions, and Guidance behaviors.
 */
type UnifiedChatPanelConnectorProps = {
  /** The Matrix sync is catching up. Tracked by the always-mounted launcher, so a resume that happened before the panel opened still counts. */
  catchingUp?: boolean;
  /** Sync has stayed lost past the notice delay (computed by the always-mounted launcher). */
  connectionLost?: boolean;
};

export const UnifiedChatPanelConnector = ({
  catchingUp = false,
  connectionLost = false,
}: UnifiedChatPanelConnectorProps) => {
  const { t, i18n } = useTranslation('crd-chat');
  const { userModel } = useCurrentUserContext();
  const currentUserId = userModel?.id;
  const navigate = useNavigate();
  const notify = useNotification();
  const chatSound = useChatSound();

  const {
    isOpen,
    setIsOpen,
    selectedConversationId,
    setSelectedConversationId,
    setSelectedRoomId,
    newlyCreatedConversationId,
    setNewlyCreatedConversationId,
  } = useUserMessagingContext();
  const { guidanceVcId } = useUnifiedChatContext();
  const { drafts, getDraft, setDraft, clearDraft } = useConversationDrafts();

  const newChat = useNewChat((conversationId, roomId) => {
    setNewlyCreatedConversationId(conversationId);
    setSelectedConversationId(conversationId);
    setSelectedRoomId(roomId);
  });

  const { conversations, isLoading } = useUnifiedConversations();
  // `?chat={conversationID}` deep link (contract C-6 / US1) — selects the
  // conversation once this list resolves, then strips the param regardless
  // of match (unknown/inaccessible id degrades to the default list, no error UI).
  useChatDeepLinkSelect(conversations, isLoading);
  const selectedConversation = conversations.find(conversation => conversation.id === selectedConversationId);
  const {
    messages: rawMessages,
    readUpToEventId,
    isLoading: messagesLoading,
  } = useConversationMessages(selectedConversation ?? null);
  const isGuidanceThread = selectedConversation?.isGuidance ?? false;

  // Calls: shown only to beta testers, in a synced session, where the environment has calls.
  const callEligibility = useCallEligibility(selectedConversation ?? null);
  const callSession = useRoomCallSession(callEligibility.matrixRoomId);
  // A call clicked while the chat credential is being replaced: it opens once the new session
  // has synced and resolved the same room again, so the call never spans the swap.
  const [queuedCall, setQueuedCall] = useState<{
    readonly conversationId: string;
    readonly matrixRoomId: string;
    readonly intent: ReturnType<typeof callIntentFor>;
    readonly swapDone: boolean;
  } | null>(null);
  useEffect(() => {
    if (!queuedCall) {
      return;
    }
    if (queuedCall.conversationId !== selectedConversationId) {
      setQueuedCall(null);
    } else if (queuedCall.swapDone && callEligibility.matrixRoomId === queuedCall.matrixRoomId) {
      setQueuedCall(null);
      openCall({ matrixRoomId: queuedCall.matrixRoomId, intent: queuedCall.intent });
    }
  }, [queuedCall, selectedConversationId, callEligibility.matrixRoomId]);
  // A call that has not opened by then is dropped, so none opens (or rings) long after the click,
  // and the user is told to try again.
  const [droppedCallIn, setDroppedCallIn] = useState<string | null>(null);
  const queuedIn = queuedCall?.conversationId ?? null;
  useEffect(() => {
    if (!queuedIn) {
      return;
    }
    const timer = setTimeout(() => {
      setQueuedCall(null);
      setDroppedCallIn(queuedIn);
    }, QUEUED_CALL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [queuedIn]);
  useEffect(() => {
    if (!droppedCallIn) {
      return;
    }
    const timer = setTimeout(() => setDroppedCallIn(null), DROPPED_CALL_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [droppedCallIn]);
  const activeCallRooms = useActiveCallRooms(conversations);

  // Realtime conversation events are subscribed globally by
  // <ConversationEventsSubscriber /> (mounted in root.tsx) so they arrive with
  // the panel closed too. The selected room's message stream is inside the view hook.
  // The conversation the reader has scrolled up in. Messages that arrive there are not on
  // screen, so the read marker waits until the reader is back at the latest message.
  const [scrolledUpIn, setScrolledUpIn] = useState<string | null>(null);
  const isReadingOlder = scrolledUpIn !== null && scrolledUpIn === selectedConversationId;
  const { isSending, handleSendMessage, handleAddReaction, handleRemoveReaction, handleLeaveGroup, clearGuidance } =
    useUnifiedConversationView(selectedConversation ?? null, isReadingOlder ? null : readUpToEventId);

  const groupSettings = useGroupSettings(selectedConversation?.id, selectedConversation?.members ?? [], {
    displayName: selectedConversation?.roomDisplayName ?? '',
    avatarUrl: selectedConversation?.avatarUri ?? '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const justClearedRef = useRef(false);

  // The guidance conversation id can change after a clear; re-point the open
  // thread to the (possibly new) guidance conversation once the refetch lands.
  const guidanceConversation = conversations.find(conversation => conversation.isGuidance);
  const guidanceResponse = useGuidanceResponseState(guidanceConversation, currentUserId);
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

  const matrixClient = useMatrixClient();
  const handleTogglePin = (id: string) => {
    const conversation = conversations.find(item => item.id === id);
    if (!conversation) {
      return;
    }
    if (!matrixClient) {
      notify(t('list.pinError'), 'error');
      return;
    }
    // The store shows the pin at once and takes it back if the write fails.
    storeFor(matrixClient)
      .togglePin(conversation.roomId)
      .catch(() => notify(t('list.pinError'), 'error'));
  };

  const ownStatus = useOwnStatusMessage();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const handleSaveStatus = (statusMessage: string) => {
    ownStatus.setStatusMessage(statusMessage).catch(() => notify(t('status.saveError'), 'error'));
  };

  const listItems = withActiveCallsFirst(
    conversations.map(conversation => {
      const mapped = mapConversationToListItem(conversation, { currentUserId, formatTimestamp });
      const item = activeCallRooms.has(conversation.roomId) ? { ...mapped, hasActiveCall: true } : mapped;
      const draft = drafts[conversation.id];
      // A draft replaces the last-message preview but leaves the ordering and the
      // timestamp alone — the conversation does not jump the list for it.
      return draft ? { ...item, draftPreview: draft.trim() } : item;
    }),
    newlyCreatedConversationId
  );

  const view = selectedConversationId ? 'thread' : 'list';

  // Header identity is derived from the same mapped list item the conversation
  // list renders for this conversation — header ≡ list row by construction
  // (research D4), so the two surfaces can never disagree (US2/US3).
  const selectedListItem = listItems.find(item => item.id === selectedConversationId);
  const conversationAvatar = selectedListItem && (
    <ConversationAvatar
      size="sm"
      displayName={selectedListItem.displayName}
      avatarUrl={selectedListItem.avatarUrl}
      isGroup={selectedListItem.isGroup}
      isGuidance={selectedListItem.isGuidance}
      memberAvatars={selectedListItem.memberAvatars}
    />
  );
  // A 1:1 header avatar is the counterpart's: it carries their availability and opens their card.
  const counterpart =
    selectedConversation && !selectedConversation.isGroup && !selectedConversation.isGuidance
      ? selectedConversation.members.find(member => member.id !== currentUserId)
      : undefined;
  let titleAvatar: ReactNode;
  if (view === 'thread' && conversationAvatar) {
    titleAvatar = counterpart ? (
      <UserPresencePopover
        displayName={counterpart.displayName}
        statusMessage={counterpart.statusMessage}
        presence={counterpart.presence}
      >
        {conversationAvatar}
      </UserPresencePopover>
    ) : (
      conversationAvatar
    );
  }

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

  let chatMessages = rawMessages.map(message => mapMessageToChatMessage(message, { currentUserId }));
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
    setScrolledUpIn(null);
    setSelectedConversationId(null);
    setSelectedRoomId(null);
  };

  // The reaction hooks reject when Matrix refuses the event; the message stays unchanged,
  // so surface the same generic error toast a failed GraphQL mutation shows.
  const notifyReactionFailed = () => notify(t('apollo.errors.generic', { ns: 'crd-common' }), 'error');

  const onAddReaction = (messageId: string, emoji: string) => {
    handleAddReaction(messageId)(emoji)?.catch(notifyReactionFailed);
  };

  // CommentReactions toggles by emoji; resolve the current user's reaction id for removal.
  const onRemoveReaction = (messageId: string, emoji: string) => {
    const raw = rawMessages.find(message => message.id === messageId);
    const reaction = raw?.reactions.find(item => item.emoji === emoji && item.sender?.id === currentUserId);
    if (reaction) {
      handleRemoveReaction(reaction.id)?.catch(notifyReactionFailed);
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

  let headerActions: ReactNode;
  if (isGuidanceThread) {
    headerActions = (
      <>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label={t('guidance.infoButton')}
          className={chatHeaderIconButtonClass}
        >
          <Info aria-hidden="true" className={chatHeaderIconClass} />
        </button>
        <button
          type="button"
          onClick={() => setClearConfirmOpen(true)}
          aria-label={t('guidance.clear')}
          className={chatHeaderIconButtonClass}
        >
          <Trash2 aria-hidden="true" className={chatHeaderIconClass} />
        </button>
      </>
    );
  } else if (selectedConversation) {
    const { isGroup } = selectedConversation;
    const { matrixRoomId } = callEligibility;
    const conversationId = selectedConversation.id;
    const openCallWith = (action: CallAction, media: CallMedia) => {
      if (!matrixRoomId || queuedCall) {
        return;
      }
      const intent = callIntentFor({ isGroup, action, media });
      setDroppedCallIn(null);
      setQueuedCall({ conversationId, matrixRoomId, intent, swapDone: false });
      // A due chat credential is replaced first: a call open across the swap would end.
      void rotateActiveSessionIfDue().then(rotated => {
        if (rotated) {
          setQueuedCall(queued => (queued ? { ...queued, swapDone: true } : null));
        } else {
          setQueuedCall(null);
          openCall({ matrixRoomId, intent });
        }
      });
    };
    let callActions: ReactNode = null;
    if (callEligibility.eligible) {
      callActions =
        callSession.participantCount > 0 ? (
          <ActiveCallIndicator
            activeLabel={t('call.active')}
            count={callSession.participantCount}
            joinedNote={
              callSession.isJoinedOnThisDevice && !callSession.isJoinedHere ? t('call.joinedOnThisDevice') : undefined
            }
            // Every tab of a browser is the same chat device: a join from a second tab would
            // write over the first tab's membership, and its leave would end both.
            join={
              callSession.isJoinedOnThisDevice
                ? undefined
                : {
                    joinLabel: t('call.join'),
                    joinVideoLabel: t('call.joinVideo'),
                    joinAudioLabel: t('call.joinAudio'),
                    onJoinVideo: () => openCallWith('join', 'video'),
                    onJoinAudio: () => openCallWith('join', 'voice'),
                  }
            }
          />
        ) : (
          <CallControls
            startAudioLabel={t('call.startAudio')}
            startVideoLabel={t('call.startVideo')}
            onStartAudio={() => openCallWith('start', 'voice')}
            onStartVideo={() => openCallWith('start', 'video')}
          />
        );
    }
    if (isGroup) {
      headerActions = (
        <div className="flex min-w-0 items-center gap-1">
          {callActions}
          <ChatOptionsMenu
            label={t('thread.options')}
            settingsLabel={t('group.settings')}
            onOpenSettings={groupSettings.openDialog}
            leaveLabel={t('group.leave')}
            onLeave={() => setLeaveConfirmOpen(true)}
          />
        </div>
      );
    } else if (callActions) {
      headerActions = <div className="flex min-w-0 items-center gap-1">{callActions}</div>;
    }
  }
  const isGroupThread = view === 'thread' && Boolean(selectedConversation?.isGroup);

  const groupMembers = selectedConversation
    ? mapMembersToGroupMembers(selectedConversation.members, currentUserId)
    : [];

  const handleLeaveGroupConfirmed = async () => {
    await handleLeaveGroup();
    groupSettings.onOpenChange(false);
    handleBack();
  };

  const groupAvatarSlot = (
    <>
      <button
        type="button"
        onClick={() => avatarInputRef.current?.click()}
        aria-label={t('group.avatar.edit')}
        className="flex items-center gap-3 rounded-md p-1 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {groupSettings.isUploadingAvatar ? (
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
          </span>
        ) : groupSettings.avatarUrl ? (
          <Avatar className="size-12">
            <AvatarImage src={groupSettings.avatarUrl} alt="" />
          </Avatar>
        ) : (
          <GroupAvatar members={selectedListItem?.memberAvatars ?? []} size="lg" />
        )}
        <span className="text-control text-muted-foreground">{t('group.avatar.edit')}</span>
      </button>
      <input
        ref={avatarInputRef}
        type="file"
        accept={(groupSettings.visualConstraints?.allowedTypes ?? []).join(',')}
        className="hidden"
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) {
            groupSettings.onAvatarFileSelected(file);
          }
          event.target.value = '';
        }}
      />
    </>
  );

  return (
    <>
      <ChatPanel
        open={isOpen}
        title={view === 'thread' ? (threadHeader?.displayName ?? '') : t('panel.title')}
        onClose={() => setIsOpen(false)}
        closeLabel={t('launcher.close')}
        onBack={view === 'thread' ? handleBack : undefined}
        backLabel={t('thread.back')}
        // The gear is about chat in general, so it lives in the list header only; a
        // conversation's own options are in its header menu.
        settingsMenu={
          view === 'list' ? (
            <ChatSettingsMenu
              label={t('panel.settings')}
              statusLabel={ownStatus.statusMessage ? t('status.change') : t('status.set')}
              onEditStatus={() => setStatusDialogOpen(true)}
              notificationSettingsLabel={t('panel.settings')}
              onOpenNotificationSettings={() => {
                // Close first: the panel lives outside <Routes> and the messaging context has
                // no route listener, so navigating alone leaves it mounted. On a small screen
                // it is `fixed inset-0`, which would cover the settings page it just opened.
                setIsOpen(false);
                navigate(buildUserNotificationSettingsUrl());
              }}
            />
          ) : undefined
        }
        // The sound is on or off for the whole chat, never per conversation, so like the gear
        // the toggle lives in the list header only.
        onToggleSound={
          view === 'list' && chatSound.setEnabled
            ? () => {
                // A failed save is reported by the global error handler; the toggle stays as it was.
                chatSound.setEnabled?.(!chatSound.enabled).catch(() => undefined);
              }
            : undefined
        }
        soundMuted={!chatSound.enabled}
        muteSoundLabel={t('panel.muteSound')}
        unmuteSoundLabel={t('panel.unmuteSound')}
        expandLabel={t('panel.expand')}
        collapseLabel={t('panel.collapse')}
        titleAvatar={titleAvatar}
        onTitleClick={isGroupThread ? groupSettings.openDialog : undefined}
        titleActionLabel={isGroupThread ? t('group.settings') : undefined}
        subtitle={
          view === 'list' && ownStatus.statusMessage ? (
            <button
              type="button"
              onClick={() => setStatusDialogOpen(true)}
              aria-label={t('status.edit', { status: ownStatus.statusMessage })}
              className="min-w-0 truncate rounded-sm text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ownStatus.statusMessage}
            </button>
          ) : undefined
        }
        headerActions={view === 'thread' ? headerActions : undefined}
        notice={
          queuedCall && view === 'thread' ? (
            <ChatConnectionNotice kind="busy" message={t('call.preparing')} />
          ) : droppedCallIn && droppedCallIn === selectedConversationId && view === 'thread' ? (
            <ChatConnectionNotice kind="failed" message={t('call.dropped')} />
          ) : connectionLost ? (
            <ChatConnectionNotice message={t('panel.reconnecting')} />
          ) : undefined
        }
      >
        {view === 'thread' && selectedConversationId ? (
          <ConversationThread
            key={selectedConversationId}
            conversationId={selectedConversationId}
            roomId={selectedConversation?.roomId}
            attachmentsAllowed={!isGuidanceThread}
            conversation={threadHeader}
            onFollowingChange={following => setScrolledUpIn(following ? null : (selectedConversationId ?? null))}
            messages={chatMessages}
            // Older history paging in, or the sync bringing newer messages: both may change what the thread shows.
            messagesLoading={messagesLoading || catchingUp}
            locale={resolveChatLocale(i18n.language, navigator.languages)}
            currentUser={currentUser}
            isSending={isSending}
            // No reactions on the AI assistant thread (incl. the synthetic intro) — FR-016a.
            canReact={Boolean(selectedConversation) && !isGuidanceThread}
            // Background-tracked, but only shown while the guidance thread is open.
            isAwaitingGuidanceResponse={isGuidanceThread && guidanceResponse.awaiting}
            // Keyed by conversation, so re-pointing the open thread (guidance
            // clear) swaps the draft instead of carrying it into the new one.
            draft={selectedConversationId ? getDraft(selectedConversationId) : ''}
            onDraftChange={value => {
              if (selectedConversationId) {
                setDraft(selectedConversationId, value);
              }
            }}
            sendEvent={async (message, attachmentUpload) => {
              if (isGuidanceThread) guidanceResponse.markSent();
              return handleSendMessage(message, attachmentUpload);
            }}
            onClearDraft={() => clearDraft(selectedConversationId)}
            onRestoreDraft={text => setDraft(selectedConversationId, text)}
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
            onTogglePin={handleTogglePin}
          />
        )}
      </ChatPanel>

      <SetStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        statusMessage={ownStatus.statusMessage}
        onSave={handleSaveStatus}
      />
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
        displayName={selectedConversation?.roomDisplayName ?? ''}
        members={groupMembers}
        avatarSlot={groupAvatarSlot}
        avatarDirty={groupSettings.avatarDirty}
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
      <ImageCropDialog
        open={groupSettings.cropOpen}
        file={groupSettings.cropFile}
        config={groupSettings.visualConstraints ?? {}}
        onSave={({ file }) => groupSettings.onCropSave(file)}
        onCancel={groupSettings.onCropCancel}
        title={t('group.avatar.cropTitle')}
        saveLabel={t('group.save')}
        savingLabel={t('group.avatar.saving')}
        cancelLabel={t('actions.cancel')}
        altTextLabel={t('group.avatar.altLabel')}
        altTextPlaceholder={t('group.avatar.altPlaceholder')}
      />
      <ConfirmationDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title={t('group.leaveConfirm.title')}
        description={t('group.leaveConfirm.description')}
        confirmLabel={t('group.leaveConfirm.confirm')}
        variant="destructive"
        onConfirm={() => {
          setLeaveConfirmOpen(false);
          return handleLeaveGroupConfirmed();
        }}
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
