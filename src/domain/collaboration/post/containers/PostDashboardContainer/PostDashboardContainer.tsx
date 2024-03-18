import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  PostDashboardFragment,
  AuthorizationPrivilege,
  Scalars,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  useChallengePostQuery,
  useSpacePostQuery,
  useOpportunityPostQuery,
  useRemoveMessageOnRoomMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/user';
import { Message } from '../../../../communication/room/models/Message';
import { evictFromCache } from '../../../../../core/apollo/utils/removeFromCache';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../core/container/ComponentOrChildrenFn';
import { buildPostUrl } from '../../../../../main/routing/urlBuilders';
import { buildAuthorFromUser } from '../../../../community/user/utils/buildAuthorFromUser';
import usePostMessageMutations from '../../../../communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '../../../callout/useSubscribeOnRoomEvents';
import { compact } from 'lodash';

interface EntityIds {
  postNameId: Scalars['UUID_NAMEID'];
  // spaceNameId: Scalars['UUID_NAMEID'];
  // challengeNameId?: Scalars['UUID_NAMEID'];
  // opportunityNameId?: Scalars['UUID_NAMEID'];
  calloutId: string;
}

interface Provided {
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
}

export type PostDashboardContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

// useCalloutId
// query post
const PostDashboardContainer: FC<PostDashboardContainerProps> = ({
  spaceNameId,
  postNameId,
  challengeNameId,
  opportunityNameId,
  calloutNameId = '',
  ...rendered
}) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isPostDefined = postNameId && spaceNameId;

  const {
    data: spaceData,
    loading: spaceLoading,
    error: spaceError,
  } = useSpacePostQuery({
    variables: { spaceNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengePostQuery({
    variables: { spaceNameId, challengeNameId: challengeNameId!, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityPostQuery({
    variables: { spaceNameId, opportunityNameId: opportunityNameId!, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
    fetchPolicy: 'cache-and-network',
  });

  const collaborationCallouts =
    spaceData?.space?.collaboration?.callouts ??
    challengeData?.space?.challenge?.collaboration?.callouts ??
    opportunityData?.space?.opportunity?.collaboration?.callouts;

  const parentCallout = collaborationCallouts?.find(c => c.nameID === calloutNameId);

  const post = parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post;
  const loading = spaceLoading || challengeLoading || opportunityLoading;
  const error = spaceError ?? challengeError ?? opportunityError;

  const roomId = compact([
    parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post?.comments.id,
    parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post?.comments.id,
    parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post?.comments.id,
  ])[0];

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId);

  const creator = post?.createdBy;
  const creatorAvatar = creator?.profile.avatar?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = post?.createdDate.toString();

  const _messages = useMemo(() => post?.comments?.messages ?? [], [post?.comments?.messages]);
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

  const postUrl = buildPostUrl(calloutNameId, postNameId, {
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    canAddReaction,
    post,
    messages,
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
