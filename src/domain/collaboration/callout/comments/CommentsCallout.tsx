import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts/useCallouts';
import CommentsComponent from '../../../communication/room/Comments/CommentsComponent';
import { useUserContext } from '../../../community/contributor/user';
import { useRemoveCommentFromCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import useSubscribeOnCommentCallout from '../useSubscribeOnCommentCallout';
import usePostMessageMutations from '../../../communication/room/Comments/usePostMessageMutations';
import { useMessages } from '../../../communication/room/Comments/useMessages';

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
    const messages = useMessages(fetchedMessages);

    const isAuthor = useCallback(
      (msgId: string, userId?: string) => messages?.find(x => x.id === msgId)?.author?.id === userId ?? false,
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

    const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
      roomId: commentsId,
      isSubscribedToMessages: isSubscribedToComments,
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
            postMessage={postMessage}
            postReply={postReply}
            canDeleteMessage={canDeleteMessage}
            handleDeleteMessage={handleDeleteMessage}
            loading={loading || postingMessage || postingReply || deletingMessage}
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
