import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, CalendarEventDetailsFragment } from '../../../core/apollo/generated/graphql-schema';
import {
  MessageDetailsFragmentDoc,
  useCalendarEventDetailsQuery,
  usePostCommentMutation,
  useRemoveCommentMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../common/utils/containers/ComponentOrChildrenFn';
import { useUserContext } from '../../community/contributor/user';
import { Message } from '../../shared/components/Comments/models/message';
import { evictFromCache } from '../../shared/utils/apollo-cache/removeFromCache';
import { buildAuthorFromUser } from '../../../common/utils/buildAuthorFromUser';
import useCalendarEventCommentsMessageReceivedSubscription from './calendar/useCalendarEventCommentsMessageReceivedSubscription';

export type CalendarEventDetailData = CalendarEventDetailsFragment;

interface EventIds {
  hubNameId: string;
  eventId: string | undefined;
}

interface Provided {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  event?: CalendarEventDetailData;
  messages: Message[];
  commentsId?: string;
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  handlePostComment: (commentsId: string, message: string) => void;
  handleDeleteComment: (commentsId: string, messageId: string) => void;
  loading: boolean;
  error?: ApolloError;
  deletingComment?: boolean;
  postingComment?: boolean;
}
export type CalendarEventDetailContainerProps = ContainerPropsWithProvided<EventIds, Provided>;

// TODO: VERY BASED ON domain/collaboration/aspect/containers/AspectDashboardContainer/AspectDashboardContainer.tsx
// Maybe put common logic together
const CalendarEventDetailContainer: FC<CalendarEventDetailContainerProps> = ({ hubNameId, eventId, ...rendered }) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const {
    data,
    loading: loadingEvent,
    error,
    subscribeToMore: subscribeToMessages,
  } = useCalendarEventDetailsQuery({
    variables: { hubId: hubNameId, eventId: eventId! },
    skip: !hubNameId || !eventId,
    fetchPolicy: 'cache-and-network',
  });
  const loading = !eventId || loadingEvent;
  const event = data?.hub.timeline?.calendar.event;

  const eventCommentsSubscription = useCalendarEventCommentsMessageReceivedSubscription(
    data,
    eventData => eventData?.hub?.timeline?.calendar.event,
    subscribeToMessages
  );

  const isSubscribedToComments = eventCommentsSubscription.enabled;

  const creator = event?.createdBy;
  const creatorAvatar = creator?.profile.visual?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = event?.createdDate.toString();

  const commentsId = event?.comments?.id;
  const _messages = useMemo(() => event?.comments?.messages ?? [], [event?.comments?.messages]);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: x?.sender ? buildAuthorFromUser(x.sender) : undefined,
        createdAt: new Date(x.timestamp),
      })),
    [_messages]
  );

  const isAuthor = useCallback(
    (msgId: string, userId?: string) => messages.find(x => x.id === msgId)?.author?.id === userId ?? false,
    [messages]
  );

  const commentsPrivileges = event?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [user, isAuthenticated, canDeleteComments, isAuthor]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentMutation({
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

  const [postComment, { loading: postingComment }] = usePostCommentMutation({
    update: (cache, { data }) => {
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
          commentsCount(oldCount = 0) {
            if (!data) {
              return oldCount;
            }

            return oldCount + 1;
          },
        },
      });

      if (isSubscribedToComments) {
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

  const handlePostComment = async (commentsId: string, message: string) =>
    postComment({
      variables: {
        messageData: {
          roomID: commentsId,
          message,
        },
      },
    });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    event,
    messages,
    commentsId,
    creatorAvatar,
    creatorName,
    createdDate,
    handlePostComment,
    handleDeleteComment,
    loading,
    error,
    deletingComment,
    postingComment,
  });
};

export default CalendarEventDetailContainer;
