import { useCallback, useMemo } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user';
import { Message } from '@/domain/communication/room/models/Message';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { usePostQuery } from '@/core/apollo/generated/apollo-hooks';

interface usePostProps {
  postId: string | undefined;
}

type usePostProvided = {
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canReadComments: boolean;
    canPostComments: boolean;
    canDeleteComment: (authorId: string | undefined) => boolean;
    canAddReaction: boolean;
  };

  post:
    | {
        id: string;
        createdDate: string | Date;
        profile: {
          displayName: string;
          description?: string;
          url: string;
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
      id: string;
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

const usePost = ({ postId }: usePostProps): usePostProvided => {
  const { user: userMetadata, isAuthenticated } = useUserContext();

  const user = userMetadata?.user;

  const { data, loading } = usePostQuery({
    variables: {
      postId: postId!,
    },
    skip: !postId,
    fetchPolicy: 'cache-and-network',
  });

  const post = data?.lookup.post;
  const roomId = post?.comments.id;

  const _messages = useMemo(() => post?.comments?.messages ?? [], [post?.comments?.messages]);
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

  const vcInteractions = useMemo(() => post?.comments?.vcInteractions ?? [], [post?.comments?.vcInteractions]);

  // TODO: This is temporary:
  // Disabling all comments interaction with this Posts in the VC knowledge-base until we have server fixed
  const { vcId } = useUrlResolver();
  const commentsPrivileges = vcId ? [] : post?.comments?.authorization?.myPrivileges ?? [];

  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    authorId => canDeleteComments || (isAuthenticated && authorId === user?.id),
    [user, isAuthenticated, canDeleteComments]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage);
  const canAddReaction = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessageReaction);

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId);
  const { postMessage, postReply, postingMessage, postingReply, deleteMessage, deletingMessage } =
    usePostMessageMutations({ roomId, isSubscribedToMessages });

  return {
    permissions: {
      canUpdate: post?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
      canDelete: post?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false,
      canReadComments,
      canPostComments,
      canDeleteComment,
      canAddReaction,
    },
    post,
    comments: {
      roomId: post?.comments.id,
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

export default usePost;
