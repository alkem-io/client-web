import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import React, { useCallback, useMemo } from 'react';
import { OptionalCoreEntityIds } from '../../../shared/types/CoreEntityIds';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts';
import CommentsComponent from '../../../shared/components/Comments/CommentsComponent';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';
import {
  MessageDetailsFragmentDoc,
  usePostCommentInCalloutMutation,
  useRemoveCommentFromCalloutMutation,
} from '../../../../hooks/generated/graphql';
import { useAuthorsDetails } from '../../../communication/communication/useAuthorsDetails';
import { Message } from '../../../shared/components/Comments/models/message';
import { AuthorizationPrivilege } from '../../../../models/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData;
  };
  isSubscribedToComments: boolean;
  loading?: boolean;
}

const CommentsCallout = ({
  callout,
  loading,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
  isSubscribedToComments,
}: CommentsCalloutProps) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const commentsId = callout.comments.id;
  const _messages = callout?.comments?.messages ?? [];
  const senders = _messages.map(x => x.sender);
  const { getAuthor } = useAuthorsDetails(senders);
  const messages = useMemo<Message[]>(
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
  const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    msgId => canDeleteMessages || (isAuthenticated && isAuthor(msgId, user?.id)),
    [messages, user, isAuthenticated, canDeleteMessages]
  );

  const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostMessages = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteMessage, { loading: deletingMessage }] = useRemoveCommentFromCalloutMutation({
    onError: handleError,
    update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
  });

  const handleDeleteMessage = (commentsId: string, messageId: string) =>
    deleteMessage({
      variables: {
        messageData: {
          commentsID: commentsId,
          messageID: messageId,
        },
      },
    });

  const [postMessage, { loading: postingComment }] = usePostCommentInCalloutMutation({
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

  const handlePostMessage = async (commentsId: string, message: string) =>
    postMessage({
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
          canReadMessages={canReadMessages}
          canPostMessages={canPostMessages}
          handlePostMessage={handlePostMessage}
          canDeleteMessage={canDeleteMessage}
          handleDeleteMessage={handleDeleteMessage}
          loading={loading || postingComment || deletingMessage}
        />
      </CalloutLayout>
    </>
  );
};

export default CommentsCallout;
