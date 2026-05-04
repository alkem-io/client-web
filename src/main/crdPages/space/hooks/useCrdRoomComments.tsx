import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
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
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const mentionSearch = useMentionableContributors();

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

  const comments = mapRoomToCommentData(room, { currentUserId: userModel?.id });

  const currentUser = userModel
    ? {
        id: userModel.id,
        name: userModel.profile?.displayName ?? t('comments.unknownUser'),
        avatarUrl: userModel.profile?.avatar?.uri,
      }
    : undefined;

  const messagesLookup = new Map(room?.messages.map(message => [message.id, message]) ?? []);

  // Mutation in-flight states for the inner CommentThread/CommentInput.
  // External loading (e.g. the lazy contribution-comments query in
  // CalloutCommentsConnector) is intentionally NOT folded in here — that
  // window is invisible to the user (the connector is gated by useInView,
  // so the user only sees the slot once the query has resolved).
  const loading = postingMessage || postingReply || deletingMessage;

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
        loading={loading}
        comments={comments}
        currentUser={currentUser}
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

  const commentInput = canComment ? (
    <CommentInput
      currentUser={currentUser}
      disabled={loading}
      mentionSearch={mentionSearch}
      onSubmit={content => {
        void postMessage(content);
      }}
    />
  ) : null;

  return { thread, commentInput, commentCount: comments.length };
}
