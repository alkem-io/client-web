import { useCallback, useMemo } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { Message } from '@/domain/communication/room/models/Message';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { useCalendarEventDetailsQuery } from '@/core/apollo/generated/apollo-hooks';

interface useCalendarEventProps {
  eventId: string | undefined;
}

type useCalendarEventProvided = {
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canReadComments: boolean;
    canPostComments: boolean;
    canDeleteComment: (authorId: string | undefined) => boolean;
    canAddReaction: boolean;
  };

  event?:
    | {
        id: string;
        createdDate?: string | Date;
        type?: string;
        startDate?: Date;
        durationDays?: number | undefined;
        durationMinutes: number;
        wholeDay?: boolean;
        profile: {
          displayName: string;
          description?: string;
          url: string;
          location?: {
            city?: string;
          };
          references?: {
            id: string;
            name: string;
            uri: string;
            description?: string;
          }[];
          tagset?: {
            tags: string[];
          };
          banner?: {
            id: string;
            uri: string;
          };
        };
        createdBy?: {
          profile: {
            displayName: string;
            avatar?: {
              id: string;
              uri: string;
            };
          };
        };
      }
    | undefined;

  comments: {
    roomId: string | undefined;
    messages: Message[];
    vcInteractions: {
      threadID: string;
      virtualContributorID: string;
    }[];
  };

  actions: {
    postMessage: (message: string) => Promise<unknown>;
    postReply: (reply: { messageText: string; threadId: string }) => Promise<unknown>;
    deleteMessage: (commentsId: string, messageId: string) => Promise<unknown>;
  };
  loading: {
    loading: boolean;
    deletingMessage: boolean;
    postingMessage: boolean;
    postingReply: boolean;
  };
};

const useCalendarEvent = ({ eventId }: useCalendarEventProps): useCalendarEventProvided => {
  const { userModel, isAuthenticated } = useCurrentUserContext();

  const { data, loading } = useCalendarEventDetailsQuery({
    variables: {
      eventId: eventId!,
    },
    skip: !eventId,
    fetchPolicy: 'cache-and-network',
  });

  const event = data?.lookup.calendarEvent;
  const roomId = event?.comments.id;

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId);

  const _messages = useMemo(() => event?.comments?.messages ?? [], [event?.comments?.messages]);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        message: x.message,
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
    authorId => canDeleteComments || (isAuthenticated && authorId === userModel?.id),
    [userModel, isAuthenticated, canDeleteComments]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage);
  const canAddReaction = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessageReaction);

  const { postMessage, postReply, postingMessage, postingReply, deleteMessage, deletingMessage } =
    usePostMessageMutations({
      roomId,
      isSubscribedToMessages,
    });
  return {
    permissions: {
      canUpdate: event?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
      canDelete: event?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false,
      canReadComments,
      canPostComments,
      canDeleteComment,
      canAddReaction,
    },
    event,
    comments: {
      roomId,
      messages,
      vcInteractions,
    },
    actions: {
      postMessage,
      postReply,
      deleteMessage,
    },
    loading: {
      loading,
      deletingMessage,
      postingMessage,
      postingReply,
    },
  };
};

export default useCalendarEvent;
