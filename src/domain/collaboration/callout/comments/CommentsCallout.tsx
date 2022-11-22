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
import { Message } from '../../../shared/components/Comments/models/message';
import { AuthorizationPrivilege, CalloutState } from '../../../../models/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData;
  };
  calloutNames: string[];
  isSubscribedToComments: boolean;
  loading?: boolean;
}

const CommentsCallout = ({
  callout,
  calloutNames,
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
  const _messages = useMemo(() => callout?.comments?.messages ?? [], [callout]);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: x?.sender.id ? buildAuthorFromUser(x.sender) : undefined,
        createdAt: new Date(x.timestamp),
      })),
    [_messages]
  );

  const isAuthor = useCallback(
    (msgId: string, userId?: string) => messages.find(x => x.id === msgId)?.author?.id === userId ?? false,
    [messages]
  );

  const commentsPrivileges = callout?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    msgId => canDeleteMessages || (isAuthenticated && isAuthor(msgId, user?.id)),
    [user, isAuthenticated, isAuthor, canDeleteMessages]
  );

  const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostMessages =
    commentsPrivileges.includes(AuthorizationPrivilege.CreateComment) && callout.state !== CalloutState.Closed;

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
        calloutNames={calloutNames}
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
