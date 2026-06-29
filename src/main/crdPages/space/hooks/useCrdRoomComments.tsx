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
import { mapRoomToCommentData } from '../dataMappers/commentDataMapper';
import { useMentionableContributors } from './useMentionableContributors';

type UseCrdRoomCommentsParams = {
  roomId: string;
  /** Pre-loaded room object. Either fetched lazily by the consumer
   *  (CalloutCommentsConnector with useInView gating) or eagerly available
   *  (CalendarCommentsConnector — already loaded by useCalendarEventDetail). */
  room: Pick<CommentsWithMessagesModel, 'messages' | 'authorization'> | undefined;
  /** When true, do not subscribe to live room events. CalloutCommentsConnector
   *  forwards `!inView` here for lazy subscription; CalendarCommentsConnector
   *  omits to default to false (always subscribe). */
  skipSubscription?: boolean;
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

  const comments = mapRoomToCommentData(room, { currentUserId: userModel?.id, t: tMain });

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
          void postReply({ messageText: content, threadId: parentId });
        }}
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
    <CommentInput
      currentUser={currentUser}
      disabled={inputBusy}
      mentionSearch={mentionSearch}
      onSubmit={content => {
        void postMessage(content);
      }}
    />
  ) : cantCommentNotice ? (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-body text-muted-foreground">
      {cantCommentNotice}
    </p>
  ) : null;

  return { thread, commentInput, commentCount: comments.length };
}
