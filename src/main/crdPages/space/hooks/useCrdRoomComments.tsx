import type { ReactNode } from 'react';
import { useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { mapRoomToCommentData } from '../dataMappers/commentDataMapper';

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
  /** Additional loading flag OR-combined with internal mutation states. Used
   *  by consumers with their own async state (e.g. lazy query loading). */
  externalLoading?: boolean;
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
  externalLoading = false,
}: UseCrdRoomCommentsParams): CrdRoomCommentsSlots {
  const { userModel, isAuthenticated } = useCurrentUserContext();

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
        name: userModel.profile?.displayName ?? 'Unknown user',
        avatarUrl: userModel.profile?.avatar?.uri,
      }
    : undefined;

  const messagesLookup = new Map(room?.messages.map(message => [message.id, message]) ?? []);

  const loading = externalLoading || postingMessage || postingReply || deletingMessage;

  const handleDelete = async (commentId: string) => {
    await deleteMessage({
      variables: {
        messageData: {
          roomID: roomId,
          messageID: commentId,
        },
      },
    });
  };

  const thread = (
    <CommentThread
      loading={loading}
      comments={comments}
      canComment={canComment}
      currentUser={currentUser}
      onAddComment={content => {
        void postMessage(content);
      }}
      onReply={(parentId, content) => {
        void postReply({ messageText: content, threadId: parentId });
      }}
      onDelete={commentId => {
        void handleDelete(commentId);
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
  );

  const commentInput = canComment ? (
    <CommentInput
      currentUser={currentUser}
      disabled={loading}
      onSubmit={content => {
        void postMessage(content);
      }}
    />
  ) : null;

  return { thread, commentInput, commentCount: comments.length };
}
