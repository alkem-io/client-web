import { useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, PostDashboardFragment } from '@/core/apollo/generated/graphql-schema';
import { usePostQuery, useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '@/domain/community/user';
import { Message } from '@/domain/communication/room/models/Message';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '@/core/container/ComponentOrChildrenFn';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';

type EntityIds = {
  postNameId: string | undefined;
  calloutId: string | undefined;
};

type Provided = {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (authorId: string | undefined) => boolean;
  canAddReaction: boolean;
  post?: PostDashboardFragment;
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
  postingComment?: boolean;
  postUrl: string;
};

export type PostDashboardContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const PostDashboardContainer = ({ calloutId, postNameId, ...rendered }: PostDashboardContainerProps) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();

  const user = userMetadata?.user;

  const { data, loading, error } = usePostQuery({
    variables: {
      postNameId: postNameId!,
      calloutId: calloutId!,
    },
    skip: !calloutId || !postNameId,
    fetchPolicy: 'cache-and-network',
  });

  const parentCallout = data?.lookup.callout;

  const post = parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post;

  const roomId = post?.comments.id;

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId);

  const creator = post?.createdBy;
  const creatorAvatar = creator?.profile.avatar?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = post?.createdDate?.toString();

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

  const commentsPrivileges = post?.comments?.authorization?.myPrivileges ?? [];
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

  const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
    roomId,
    isSubscribedToMessages,
  });

  const postUrl = post?.profile.url ?? '';

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    canAddReaction,
    post,
    messages,
    vcInteractions,
    roomId,
    creatorAvatar,
    creatorName,
    createdDate,
    postMessage,
    postReply,
    handleDeleteComment,
    loading,
    error,
    deletingComment,
    postingMessage,
    postingReply,
    postUrl,
  });
};

export default PostDashboardContainer;
