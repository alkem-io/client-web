import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import React, { useCallback, useMemo } from 'react';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import { DiscussionCalloutFragmentWithCallout } from '../useCallouts';
import CommentsComponent from '../../shared/components/Comments/CommentsComponent';
import { useApolloErrorHandler, useUserContext } from '../../../hooks';
import {
  MessageDetailsFragmentDoc,
  usePostCommentMutation,
  useRemoveCommentMutation,
} from '../../../hooks/generated/graphql';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import { Comment } from '../../../models/discussion/comment';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';
import { evictFromCache } from '../../shared/utils/apollo-cache/removeFromCache';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCallout = Pick<DiscussionCalloutFragmentWithCallout, NeededFields>;

interface DiscussionCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCallout;
  };
  loading?: boolean;
}

const DiscussionCallout = ({
  callout,
  loading,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
}: DiscussionCalloutProps) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isSubscribedToComments = false; //!!

  const commentsId = callout.comments.id;
  const _messages = callout?.comments?.messages ?? [];
  const senders = _messages.map(x => x.sender);
  const { getAuthor } = useAuthorsDetails(senders);
  const messages = useMemo<Comment[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: getAuthor(x.sender),
        createdAt: new Date(x.timestamp),
      })),
    [_messages, getAuthor]
  );

  const isAuthor = (msgId: string, userId?: string) =>
    messages.find(x => x.id === msgId)?.author?.id === userId ?? false;

  const commentsPrivileges = callout?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [messages, user, isAuthenticated]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentMutation({
    onError: handleError,
    update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
  });

  const handleDeleteComment = (commentsId: string, messageId: string) =>
    deleteComment({
      variables: {
        messageData: {
          commentsID: commentsId,
          messageID: messageId,
        },
      },
    });

  const [postComment, { loading: postingComment }] = usePostCommentMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (isSubscribedToComments) {
        return;
      }

      const cacheMessageId = cache.identify({
        id: commentsId,
        __typename: 'Comments',
      });

      if (!cacheMessageId) {
        return;
      }

      cache.modify({
        id: cacheMessageId,
        fields: {
          messages(existingMessages = []) {
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendComment,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

  const handlePostComment = async (commentsId: string, message: string) =>
    postComment({
      variables: {
        messageData: {
          commentsID: commentsId,
          message,
        },
      },
    });

  return (
    <>
      <CalloutLayout
        callout={callout}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        <CommentsComponent
          messages={messages}
          commentsId={commentsId}
          canReadComments={canReadComments}
          canPostComments={canPostComments}
          handlePostComment={handlePostComment}
          canDeleteComment={canDeleteComment}
          handleDeleteComment={handleDeleteComment}
          loading={loading || postingComment || deletingComment}
        />
      </CalloutLayout>
    </>
  );
};

export default DiscussionCallout;
