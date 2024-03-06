import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { useCallback, useMemo } from 'react';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts/useCallouts';
import CommentsComponent from '../../../communication/room/Comments/CommentsComponent';
import { useUserContext } from '../../../community/user';
import { useRemoveCommentFromCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../../core/apollo/utils/removeFromCache';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import useSubscribeOnRoomEvents from '../useSubscribeOnRoomEvents';
import usePostMessageMutations from '../../../communication/room/Comments/usePostMessageMutations';
import { useMessages } from '../../../communication/room/Comments/useMessages';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData | undefined;
  };
  calloutNames: string[];
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CommentsCallout = ({
  callout,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  ...calloutLayoutProps
}: CommentsCalloutProps) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const commentsId = callout.comments?.id;
  const fetchedMessages = useMemo(() => callout?.comments?.messages ?? [], [callout]);
  const messages = useMessages(fetchedMessages);

  const commentsPrivileges = callout?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    authorId => canDeleteMessages || (isAuthenticated && authorId === user?.id),
    [user, isAuthenticated, canDeleteMessages]
  );

  const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostMessages =
    commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage) &&
    callout.contributionPolicy.state !== CalloutState.Closed;
  const canAddReaction = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessageReaction);

  const [deleteMessage, { loading: deletingMessage }] = useRemoveCommentFromCalloutMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const isSubscribedToComments = useSubscribeOnRoomEvents(commentsId);

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
        canAddReaction={canAddReaction}
        loading={loading || postingMessage || postingReply || deletingMessage}
        last={lastMessageOnly}
        maxHeight={COMMENTS_CONTAINER_HEIGHT}
        onClickMore={onExpand}
      />
    </CalloutLayout>
  );
};

export default CommentsCallout;
