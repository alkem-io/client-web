import { CalloutLayoutProps } from '../calloutBlock/CalloutLayout';
import React, { useCallback, useMemo } from 'react';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts/useCallouts';
import CommentsComponent from '../../../communication/room/Comments/CommentsComponent';
import { useUserContext } from '../../../community/user';
import { useRemoveCommentFromCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutState,
  CommunityMembershipStatus,
} from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../../core/apollo/utils/removeFromCache';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import useSubscribeOnRoomEvents from '../useSubscribeOnRoomEvents';
import usePostMessageMutations from '../../../communication/room/Comments/usePostMessageMutations';
import { useMessages } from '../../../communication/room/Comments/useMessages';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import CommentsCalloutLayout from './CommentsCalloutLayout';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId' | 'vcInteractions';
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
  onCollapse,
  ...calloutSettingsProps
}: CommentsCalloutProps) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const { myMembershipStatus } = useSpace();
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
    <CalloutSettingsContainer callout={callout} expanded={expanded} {...calloutSettingsProps}>
      {calloutSettingsProvided => (
        <CommentsCalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutSettingsProvided}
          isMember={myMembershipStatus === CommunityMembershipStatus.Member}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
        >
          <CommentsComponent
            messages={messages}
            vcInteractions={callout?.comments?.vcInteractions || []}
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
            maxHeight={expanded ? undefined : COMMENTS_CONTAINER_HEIGHT}
            onClickMore={onExpand}
          />
        </CommentsCalloutLayout>
      )}
    </CalloutSettingsContainer>
  );
};

export default CommentsCallout;
