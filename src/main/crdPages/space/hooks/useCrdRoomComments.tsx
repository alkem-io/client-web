import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useNow } from '@/crd/hooks/useNow';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  type SendEvent,
  useConversationAttachments,
} from '@/main/crdPages/unifiedChat/attachments/useConversationAttachments';
import { useAttachmentReadiness } from '@/main/userMessaging/useAttachmentReadiness';
import { mapRoomToCommentData } from '../dataMappers/commentDataMapper';
import { useCommentImageStorageConfig } from './useCommentImageStorageConfig';
import { useMentionableContributors } from './useMentionableContributors';

type UseCrdRoomCommentsParams = {
  roomId: string;
  /** Pre-loaded room object. Either fetched lazily by the consumer
   *  (CalloutCommentsConnector with useInView gating) or eagerly available
   *  (CalendarCommentsConnector — already loaded by useCalendarEventDetail). */
  room: Pick<CommentsWithMessagesModel, 'messages' | 'authorization' | 'attachmentBucketId'> | undefined;
  /** When true, do not subscribe to live room events. CalloutCommentsConnector
   *  forwards `!inView` here for lazy subscription; CalendarCommentsConnector
   *  omits to default to false (always subscribe). */
  skipSubscription?: boolean;
  /** z-index escape hatches for the delete-confirmation dialog, so it stacks above
   *  a host that itself sits above the default layer — e.g. the focused-task
   *  dialog on a Tasks board (z-[110]), where the default confirm layer would open
   *  behind it and block the UI. */
  confirmOverlayClassName?: string;
  confirmContentClassName?: string;
};

export type CrdRoomCommentsSlots = {
  thread: ReactNode;
  commentInput: ReactNode | null;
  commentCount: number;
};

/**
 * Shared wiring between CalloutCommentsConnector and CalendarCommentsConnector
 * (T023a extraction — see research.md R4 for the DRY rationale).
 *
 * Handles: current-user lookup, live room subscription (optional),
 * post/reply/react/delete mutations with cache eviction, data mapping, and
 * rendering of the shared CRD comment leaf components.
 */
export function useCrdRoomComments({
  roomId,
  room,
  skipSubscription = false,
  confirmOverlayClassName,
  confirmContentClassName,
}: UseCrdRoomCommentsParams): CrdRoomCommentsSlots {
  const { t } = useTranslation('crd-space');
  // `tMain` resolves the default `translation` namespace, where the
  // `common.time.*` keys used by `formatTimeElapsed` live. Following the
  // dashboard mappers pattern (see DashboardWithMemberships → tMain).
  const { t: tMain } = useTranslation();
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const mentionSearch = useMentionableContributors();

  // Tick every 30 s so relative-time strings ("2 minutes ago") in the
  // mapper's output stay current while the thread is open. The returned
  // value is unused; the state-change inside the hook triggers re-render.
  useNow(30_000);

  const isSubscribed = useSubscribeOnRoomEvents(roomId, skipSubscription);

  const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
    roomId,
    isSubscribedToMessages: isSubscribed,
  });

  const { addReaction, removeReaction } = useCommentReactionsMutations(roomId);

  const [deleteMessage, { loading: deletingMessage }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const privileges = room?.authorization?.myPrivileges ?? [];
  const canComment = isAuthenticated && privileges.includes(AuthorizationPrivilege.CreateMessage);

  // Image attachments for the comment and reply composers. The accepted types
  // and size come from the room's own attachment bucket; the right to attach is
  // the right to post (CREATE_MESSAGE) or reply (CREATE_MESSAGE_REPLY) in the
  // room. A composer without a bucket or that right is the plain text composer:
  // its field clears on submit and the post is fired without waiting.
  //
  // An image-enabled composer carries at most one image, sent together with the
  // text in a single message, so text and image form one comment. Its field is
  // controlled and cleared only once that message is confirmed: a failed upload
  // posts nothing and keeps the text for a retry. The reply draft is keyed to the
  // open reply, so text and files staged for one reply are discarded when
  // another reply is opened or the box closes; the box stays open after a failed
  // send so the reply can be retried.
  const storageConfigs = useCommentImageStorageConfig(room?.attachmentBucketId, privileges, !canComment);
  const commentImagesEnabled = Boolean(storageConfigs.comment?.canUpload);
  const replyImagesEnabled = Boolean(storageConfigs.reply?.canUpload);
  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | undefined>(undefined);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyDraftTarget, setReplyDraftTarget] = useState<string | undefined>(undefined);
  if (replyDraftTarget !== replyTarget) {
    setReplyDraftTarget(replyTarget);
    setReplyDraft('');
  }
  const imageOptions = { maxAttachments: 1, textWithAttachment: true };
  const topLevelFiles = useConversationAttachments(storageConfigs.comment, { roomID: roomId }, imageOptions);
  const replyFiles = useConversationAttachments(
    storageConfigs.reply,
    replyTarget ? { roomID: roomId, threadID: replyTarget } : undefined,
    imageOptions
  );

  const comments = useAttachmentReadiness(
    mapRoomToCommentData(room, { currentUserId: userModel?.id, t: tMain }),
    roomId
  );

  const currentUser = userModel
    ? {
        id: userModel.id,
        name: userModel.profile?.displayName ?? t('comments.unknownUser'),
        avatarUrl: userModel.profile?.avatar?.uri,
      }
    : undefined;

  const messagesLookup = new Map(room?.messages.map(message => [message.id, message]) ?? []);

  // Mutation in-flight state. Used ONLY to disable the input while a post
  // is round-tripping; do NOT pass this to CommentThread as its `loading`
  // prop — the thread would then replace the entire comment list with a
  // spinner each time the user submits, making it feel like the section
  // is reloading. Existing comments must stay visible; the new one snaps
  // in via the cache update / subscription when the mutation resolves.
  const inputBusy = postingMessage || postingReply || deletingMessage;

  const sendTopLevel: SendEvent = async (text, attachmentUpload) =>
    Boolean((await postMessage(text, attachmentUpload)).data?.sendMessageToRoom);
  const sendReply =
    (threadId: string): SendEvent =>
    async (text, attachmentUpload) =>
      Boolean((await postReply({ threadId, messageText: text, attachmentUpload })).data?.sendMessageReplyToRoom);

  // MUI parity (CommentsComponent → ConfirmationDialog): the user confirms the
  // delete in a separate dialog before the mutation fires. `pendingDeleteId`
  // holds the comment id while the dialog is open.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>(undefined);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMessage({
        variables: {
          messageData: {
            roomID: roomId,
            messageID: pendingDeleteId,
          },
        },
      });
    } finally {
      setPendingDeleteId(undefined);
    }
  };

  const thread = (
    <>
      <CommentThread
        loading={false}
        comments={comments}
        currentUser={currentUser}
        canComment={canComment}
        mentionSearch={mentionSearch}
        onReply={(parentId, content) => {
          if (replyImagesEnabled) return replyFiles.send(content, sendReply(parentId), () => setReplyDraft(''));
          void postReply({ messageText: content, threadId: parentId });
        }}
        onReplyTargetChange={replyImagesEnabled ? setReplyTarget : undefined}
        replyInputProps={
          replyImagesEnabled
            ? {
                value: replyDraft,
                onValueChange: setReplyDraft,
                attachmentsEnabled: replyFiles.enabled,
                attachments: replyFiles.attachments,
                onAttachFiles: replyFiles.attachFiles,
                onRemoveAttachment: replyFiles.removeAttachment,
                attachmentError: replyFiles.error,
                acceptMimeTypes: replyFiles.accept,
                imagesOnly: true,
                disabled: inputBusy || replyFiles.isSending,
              }
            : undefined
        }
        onDelete={commentId => {
          setPendingDeleteId(commentId);
        }}
        onAddReaction={(commentId, emoji) => {
          void addReaction({ messageId: commentId, emoji });
        }}
        onRemoveReaction={(commentId, emoji) => {
          const reactionId = messagesLookup
            .get(commentId)
            ?.reactions.find(reaction => reaction.emoji === emoji && reaction.sender?.id === userModel?.id)?.id;

          if (!reactionId) return;

          void removeReaction(reactionId);
        }}
      />
      <ConfirmationDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(undefined);
        }}
        title={t('comments.deleteConfirmTitle')}
        description={t('comments.deleteConfirmDescription')}
        confirmLabel={t('comments.delete')}
        variant="destructive"
        overlayClassName={confirmOverlayClassName}
        contentClassName={confirmContentClassName}
        loading={deletingMessage}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </>
  );

  // When the viewer cannot post — typically because they're signed out —
  // show a hint in place of the input so the affordance is explicit
  // (mirrors the MUI legacy's "you can't reply to this discussion" footer).
  // The Reply/add-reaction affordances on each comment are independently
  // hidden via `canComment` on the thread, so this is the only thing
  // explaining *why* the viewer can't comment.
  const cantCommentNotice = !isAuthenticated
    ? t('comments.signInToComment')
    : !canComment
      ? t('comments.cantComment')
      : undefined;

  const commentInput = canComment ? (
    commentImagesEnabled ? (
      <CommentInput
        currentUser={currentUser}
        value={draft}
        onValueChange={setDraft}
        disabled={inputBusy || topLevelFiles.isSending}
        mentionSearch={mentionSearch}
        onSubmit={content => {
          void topLevelFiles.send(content, sendTopLevel, () => setDraft(''));
        }}
        attachmentsEnabled={topLevelFiles.enabled}
        attachments={topLevelFiles.attachments}
        onAttachFiles={topLevelFiles.attachFiles}
        onRemoveAttachment={topLevelFiles.removeAttachment}
        attachmentError={topLevelFiles.error}
        acceptMimeTypes={topLevelFiles.accept}
        imagesOnly={true}
      />
    ) : (
      <CommentInput
        currentUser={currentUser}
        disabled={inputBusy}
        mentionSearch={mentionSearch}
        onSubmit={content => {
          void postMessage(content);
        }}
      />
    )
  ) : cantCommentNotice ? (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-body text-muted-foreground">
      {cantCommentNotice}
    </p>
  ) : null;

  return { thread, commentInput, commentCount: comments.length };
}
