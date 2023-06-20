import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, CalendarEventDetailsFragment } from '../../../core/apollo/generated/graphql-schema';
import {
  useCalendarEventDetailsQuery,
  useRemoveMessageOnRoomMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../common/utils/containers/ComponentOrChildrenFn';
import { useUserContext } from '../../community/contributor/user';
import { Message } from '../../communication/room/models/Message';
import { evictFromCache } from '../../shared/utils/apollo-cache/removeFromCache';
import { buildAuthorFromUser } from '../../../common/utils/buildAuthorFromUser';
import useCalendarEventCommentsMessageReceivedSubscription from './calendar/useCalendarEventCommentsMessageReceivedSubscription';
import usePostMessageMutations from '../../communication/room/Comments/usePostMessageMutations';

export type CalendarEventDetailData = CalendarEventDetailsFragment;

interface EventIds {
  spaceNameId: string;
  eventId: string | undefined;
}

interface Provided {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (authorId: string | undefined) => boolean;
  event?: CalendarEventDetailData;
  messages: Message[];
  roomId: string | undefined;
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  postMessage: (message: string) => void;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  handleDeleteComment: (commentsId: string, messageId: string) => void;
  loading: boolean;
  error?: ApolloError;
  deletingComment?: boolean;
  postingMessage: boolean;
  postingReply: boolean;
}
export type CalendarEventDetailContainerProps = ContainerPropsWithProvided<EventIds, Provided>;

// TODO: VERY BASED ON domain/collaboration/post/containers/PostDashboardContainer/PostDashboardContainer.tsx
// Maybe put common logic together
const CalendarEventDetailContainer: FC<CalendarEventDetailContainerProps> = ({ spaceNameId, eventId, ...rendered }) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const {
    data,
    loading: loadingEvent,
    error,
    subscribeToMore: subscribeToMessages,
  } = useCalendarEventDetailsQuery({
    variables: { spaceId: spaceNameId, eventId: eventId! },
    skip: !spaceNameId || !eventId,
    fetchPolicy: 'cache-and-network',
  });
  const loading = !eventId || loadingEvent;
  const event = data?.space.timeline?.calendar.event;

  const eventCommentsSubscription = useCalendarEventCommentsMessageReceivedSubscription(
    data,
    eventData => eventData?.space?.timeline?.calendar.event,
    subscribeToMessages
  );

  const isSubscribedToMessages = eventCommentsSubscription.enabled;

  const creator = event?.createdBy;
  const creatorAvatar = creator?.profile.visual?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = event?.createdDate.toString();

  const roomId = event?.comments?.id;
  const _messages = useMemo(() => event?.comments?.messages ?? [], [event?.comments?.messages]);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: x?.sender ? buildAuthorFromUser(x.sender) : undefined,
        createdAt: new Date(x.timestamp),
        reactions: x.reactions,
        threadID: x.threadID,
      })),
    [_messages]
  );

  const commentsPrivileges = event?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    authorId => canDeleteComments || (isAuthenticated && authorId === user?.id),
    [user, isAuthenticated, canDeleteComments]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage);

  const [deleteComment, { loading: deletingComment }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const handleDeleteComment = (commentsId: string, messageId: string) =>
    deleteComment({
      variables: {
        messageData: {
          roomID: commentsId,
          messageID: messageId,
        },
      },
    });

  const postMessageProps = usePostMessageMutations({
    roomId,
    isSubscribedToMessages,
  });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    event,
    messages,
    roomId,
    creatorAvatar,
    creatorName,
    createdDate,
    handleDeleteComment,
    loading,
    error,
    deletingComment,
    ...postMessageProps,
  });
};

export default CalendarEventDetailContainer;
