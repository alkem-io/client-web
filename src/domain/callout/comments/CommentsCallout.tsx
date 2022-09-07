import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import React, { useCallback, useMemo } from 'react';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts';
import CommentsComponent from '../../shared/components/Comments/CommentsComponent';
import { useApolloErrorHandler, useUserContext } from '../../../hooks';
import {
  MessageDetailsFragmentDoc,
  usePostCommentInCalloutMutation,
  useRemoveCommentFromCalloutMutation,
} from '../../../hooks/generated/graphql';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import { Comment } from '../../../models/discussion/comment';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';
import { evictFromCache } from '../../shared/utils/apollo-cache/removeFromCache';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData;
  };
  loading?: boolean;
}

const CommentsCallout = ({
  callout,
  loading,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
}: CommentsCalloutProps) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isSubscribedToComments = false; // TODO:!! This code should be replaced when implenting task #2125

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
    [messages, user, isAuthenticated, canDeleteComments]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentFromCalloutMutation({
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

  const [postComment, { loading: postingComment }] = usePostCommentInCalloutMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (isSubscribedToComments) {
        return;
      }

      const cacheCommentsId = cache.identify({
        id: commentsId,
        __typename: 'Comments',
      });

      if (!cacheCommentsId) {
        return;
      }

      cache.modify({
        id: cacheCommentsId,
        fields: {
          messages(existingMessages = []) {
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendMessageOnCallout,
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
        data: {
          calloutID: callout.id,
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

export default CommentsCallout;
