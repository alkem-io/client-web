import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts/useCallouts';
import CommentsComponent from '../../../communication/room/Comments/CommentsComponent';
import { useUserContext } from '../../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  useRemoveCommentFromCalloutMutation,
  useSendMessageToRoomMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Message } from '../../../communication/room/models/Message';
import { AuthorizationPrivilege, CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import useSubscribeOnCommentCallout from '../useSubscribeOnCommentCallout';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData;
  };
  calloutNames: string[];
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CommentsCallout = forwardRef<HTMLDivElement, CommentsCalloutProps>(
  ({ callout, loading, expanded, contributionsCount, onExpand, blockProps, ...calloutLayoutProps }, ref) => {
    const { user: userMetadata, isAuthenticated } = useUserContext();
    const user = userMetadata?.user;

    const commentsId = callout.comments.id;
    const fetchedMessages = useMemo(() => callout?.comments?.messages ?? [], [callout]);
    const messages = useMemo<Message[]>(
      () =>
        fetchedMessages?.map(message => ({
          id: message.id,
          body: message.message,
          author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
          createdAt: new Date(message.timestamp),
          reactions: message.reactions,
        })),
      [fetchedMessages]
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
      commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage) && callout.state !== CalloutState.Closed;

    const [deleteMessage, { loading: deletingMessage }] = useRemoveCommentFromCalloutMutation({
      update: (cache, { data }) =>
        data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
    });

    const isSubscribedToComments = useSubscribeOnCommentCallout(commentsId);

    const handleDeleteMessage = (commentsId: string, messageId: string) =>
      deleteMessage({
        variables: {
          messageData: {
            roomID: commentsId,
            messageID: messageId,
          },
        },
      });

    const [postMessage, { loading: postingComment }] = useSendMessageToRoomMutation({
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
                data: data?.sendMessageToRoom,
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
          messageData: {
            roomID: commentsId,
            message,
          },
        },
      });

    const breakpoint = useCurrentBreakpoint();

    const lastMessageOnly = breakpoint === 'xs' && !expanded;

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
          expanded={expanded}
          onExpand={onExpand}
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
            last={lastMessageOnly}
            maxHeight={COMMENTS_CONTAINER_HEIGHT}
            onClickMore={onExpand}
          />
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default CommentsCallout;
