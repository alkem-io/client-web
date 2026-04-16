import type { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  useCalloutContributionCommentsQuery,
  useRemoveMessageOnRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
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

type CalloutCommentsConnectorProps = {
  roomId: string;
  calloutId?: string;
  contributionId?: string;
  roomData?: CommentsWithMessagesModel;
  children?: (slots: { thread: ReactNode; commentInput: ReactNode | null; commentCount: number }) => ReactNode;
};

export function CalloutCommentsConnector({
  roomId,
  calloutId: _calloutId,
  contributionId,
  roomData,
  children,
}: CalloutCommentsConnectorProps) {
  const { ref, inView } = useInView({ triggerOnce: true, delay: 200 });
  const { userModel, isAuthenticated } = useCurrentUserContext();

  const { data, loading } = useCalloutContributionCommentsQuery({
    variables: {
      contributionId: contributionId ?? '',
      includePost: true,
    },
    skip: !contributionId || Boolean(roomData) || !inView,
  });

  const room = roomData ?? data?.lookup.contribution?.post?.comments;
  const privileges = room?.authorization?.myPrivileges ?? [];

  const canComment = isAuthenticated && privileges.includes(AuthorizationPrivilege.CreateMessage);

  const isSubscribed = useSubscribeOnRoomEvents(roomId, !inView);

  const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
    roomId,
    isSubscribedToMessages: isSubscribed,
  });

  const { addReaction, removeReaction } = useCommentReactionsMutations(roomId);

  const [deleteMessage, { loading: deletingMessage }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const comments = mapRoomToCommentData(room, { currentUserId: userModel?.id });

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

  const currentUser = userModel
    ? {
        id: userModel.id,
        name: userModel.profile?.displayName ?? 'Unknown user',
        avatarUrl: userModel.profile?.avatar?.uri,
      }
    : undefined;

  const messagesLookup = new Map(room?.messages.map(message => [message.id, message]) ?? []);

  const thread = (
    <CommentThread
      loading={loading || postingMessage || postingReply || deletingMessage}
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

        if (!reactionId) {
          return;
        }

        void removeReaction(reactionId);
      }}
    />
  );

  const commentInput = canComment ? (
    <CommentInput
      currentUser={currentUser}
      disabled={loading || postingMessage || postingReply || deletingMessage}
      onSubmit={content => {
        void postMessage(content);
      }}
    />
  ) : null;

  if (children) {
    return (
      <div ref={ref}>
        {children({
          thread,
          commentInput,
          commentCount: comments.length,
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      {thread}
      {commentInput}
    </div>
  );
}
