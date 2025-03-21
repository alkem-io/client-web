import { CalloutLayoutProps } from '../calloutBlock/CalloutLayout';
import { useCallback, useMemo } from 'react';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import { useUserContext } from '@/domain/community/user';
import { useRemoveCommentFromCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutState,
  CommentsWithMessagesFragment,
  CommunityMembershipStatus,
} from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import useSubscribeOnRoomEvents from '../useSubscribeOnRoomEvents';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import { useMessages } from '@/domain/communication/room/Comments/useMessages';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import CommentsCalloutLayout from './CommentsCalloutLayout';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';

type NeededFields = 'id' | 'authorization' | 'messages' | 'vcInteractions';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragment, NeededFields>;

interface CommentsCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    comments?: CommentsCalloutData | undefined;
  };
  calloutActions?: boolean;
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CommentsCallout = ({
  callout,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  onCollapse,
  calloutActions = true,
  ...calloutSettingsProps
}: CommentsCalloutProps) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const { space } = useSpace();
  const myMembershipStatus = space?.about.membership?.myMembershipStatus;
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
    <CalloutSettingsContainer callout={callout} expanded={expanded} onExpand={onExpand} {...calloutSettingsProps}>
      {calloutSettingsProvided => (
        <CommentsCalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutSettingsProvided}
          isMember={myMembershipStatus === CommunityMembershipStatus.Member}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
          calloutActions={calloutActions}
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
