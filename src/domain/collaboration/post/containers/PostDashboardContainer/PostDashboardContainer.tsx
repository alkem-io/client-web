import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  PostDashboardFragment,
  AuthorizationPrivilege,
  Scalars,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  MessageDetailsFragmentDoc,
  useChallengePostQuery,
  useHubPostQuery,
  useOpportunityPostQuery,
  useRemoveMessageOnRoomMutation,
  useSendMessageToRoomMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/contributor/user';
import { Message } from '../../../../communication/messages/models/message';
import { evictFromCache } from '../../../../shared/utils/apollo-cache/removeFromCache';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../common/utils/containers/ComponentOrChildrenFn';
import usePostCommentsMessageReceivedSubscription from '../../comments/usePostCommentsMessageReceivedSubscription';
import { getCardCallout } from '../getPostCallout';
import { buildPostUrl } from '../../../../../common/utils/urlBuilders';
import { buildAuthorFromUser } from '../../../../../common/utils/buildAuthorFromUser';

interface EntityIds {
  postNameId: Scalars['UUID_NAMEID'];
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}

interface Provided {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  post?: PostDashboardFragment;
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
  postUrl: string;
}
export type PostDashboardContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const PostDashboardContainer: FC<PostDashboardContainerProps> = ({
  hubNameId,
  postNameId,
  challengeNameId,
  opportunityNameId,
  calloutNameId = '',
  ...rendered
}) => {
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isPostDefined = postNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
    subscribeToMore: subscribeToHub,
  } = useHubPostQuery({
    variables: { hubNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
    fetchPolicy: 'cache-and-network',
  });
  const hubPost = getCardCallout(hubData?.hub?.collaboration?.callouts, postNameId)?.posts?.find(
    x => x.nameID === postNameId
  );

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
    subscribeToMore: subscribeToChallenge,
  } = useChallengePostQuery({
    variables: { hubNameId, challengeNameId: challengeNameId!, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
    fetchPolicy: 'cache-and-network',
  });
  const challengePost = getCardCallout(challengeData?.hub?.challenge?.collaboration?.callouts, postNameId)?.posts?.find(
    x => x.nameID === postNameId
  );

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
    subscribeToMore: subscribeToOpportunity,
  } = useOpportunityPostQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId!, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
    fetchPolicy: 'cache-and-network',
  });
  const opportunityPost = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    postNameId
  )?.posts?.find(x => x.nameID === postNameId);

  const post = hubPost ?? challengePost ?? opportunityPost;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const hubCommentsSubscription = usePostCommentsMessageReceivedSubscription(
    hubData,
    hubData =>
      getCardCallout(hubData?.hub?.collaboration?.callouts, postNameId)?.posts?.find(x => x.nameID === postNameId),
    subscribeToHub
  );
  const challengeCommentsSubscription = usePostCommentsMessageReceivedSubscription(
    challengeData,
    challengeData =>
      getCardCallout(challengeData?.hub?.challenge?.collaboration?.callouts, postNameId)?.posts?.find(
        x => x.nameID === postNameId
      ),
    subscribeToChallenge
  );
  const opportunityCommentsSubscription = usePostCommentsMessageReceivedSubscription(
    opportunityData,
    opportunityData =>
      getCardCallout(opportunityData?.hub?.opportunity?.collaboration?.callouts, postNameId)?.posts?.find(
        x => x.nameID === postNameId
      ),
    subscribeToOpportunity
  );

  const isSubscribedToComments = [
    hubCommentsSubscription,
    challengeCommentsSubscription,
    opportunityCommentsSubscription,
  ].some(subscription => subscription.enabled);

  const creator = post?.createdBy;
  const creatorAvatar = creator?.profile.visual?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = post?.createdDate.toString();

  const commentsId = post?.comments?.id;
  const _messages = useMemo(() => post?.comments?.messages ?? [], [post?.comments?.messages]);
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

  const commentsPrivileges = post?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [user, isAuthenticated, canDeleteComments, isAuthor]
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

  const [postComment, { loading: postingComment }] = useSendMessageToRoomMutation({
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

  const postUrl = buildPostUrl(calloutNameId, postNameId, {
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    post,
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
    postUrl,
  });
};

export default PostDashboardContainer;
