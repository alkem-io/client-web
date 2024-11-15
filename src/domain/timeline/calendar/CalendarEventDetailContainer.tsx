import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, CalendarEventDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { useCalendarEventDetailsQuery, useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '@/core/container/ComponentOrChildrenFn';
import { useUserContext } from '../../community/user';
import { Message } from '../../communication/room/models/Message';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { buildAuthorFromUser } from '../../community/user/utils/buildAuthorFromUser';
import usePostMessageMutations from '../../communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '../../collaboration/callout/useSubscribeOnRoomEvents';
import { PostDashboardViewProps } from '../../collaboration/post/views/PostDashboardView';

export type CalendarEventDetailData = CalendarEventDetailsFragment;

interface EventIds {
  eventId: string | undefined;
}

interface Provided {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (authorId: string | undefined) => boolean;
  canAddReaction: boolean;
  event?: CalendarEventDetailData;
  messages: Message[];
  vcInteractions: PostDashboardViewProps['vcInteractions'];
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
const CalendarEventDetailContainer: FC<CalendarEventDetailContainerProps> = ({ eventId, ...rendered }) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const {
    data,
    loading: loadingEvent,
    error,
  } = useCalendarEventDetailsQuery({
    variables: { eventId: eventId! },
    skip: !eventId,
    fetchPolicy: 'cache-and-network',
  });
  const loading = !eventId || loadingEvent;
  const event = data?.lookup.calendarEvent;

  const roomId = event?.comments.id;
  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId);

  const creator = event?.createdBy;
  const creatorAvatar = creator?.profile.visual?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = event?.createdDate?.toString();

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

  const vcInteractions = useMemo(() => event?.comments?.vcInteractions ?? [], [event?.comments?.vcInteractions]);

  const commentsPrivileges = event?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    authorId => canDeleteComments || (isAuthenticated && authorId === user?.id),
    [user, isAuthenticated, canDeleteComments]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage);
  const canAddReaction = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessageReaction);

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
    canAddReaction,
    event,
    messages,
    vcInteractions,
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
