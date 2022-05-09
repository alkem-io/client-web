import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AspectDashboardFragment, AuthorizationPrivilege, Scalars } from '../../../models/graphql-schema';
import {
  AspectMessageFragmentDoc,
  useAspectCreatorQuery,
  useChallengeAspectQuery,
  useHubAspectQuery,
  useOpportunityAspectQuery,
  usePostCommentInAspectMutation,
  useRemoveCommentFromAspectMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../hooks';
import { Comment } from '../../../models/discussion/comment';
import { useAuthorsDetails } from '../../../domain/communication/useAuthorsDetails';
import { evictFromCache } from '../../../domain/shared/utils/apollo-cache/removeFromCache';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../common/utils/containers/ComponentOrChildrenFn';
import useAspectCommentsMessageReceivedSubscription from '../../../domain/aspect/comments/useAspectCommentsMessageReceivedSubscription';
import { getCardCallout } from '../getAspectCallout';

interface EntityIds {
  aspectNameId: Scalars['UUID_NAMEID'];
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}

interface Provided {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  aspect?: AspectDashboardFragment;
  messages: Comment[];
  commentId?: string;
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  handlePostComment: (commentId: string, message: string) => void;
  handleDeleteComment: (commentId: string, messageId: string) => void;
  loading: boolean;
  loadingCreator: boolean;
  error?: ApolloError;
  deletingComment?: boolean;
  postingComment?: boolean;
}
export type AspectDashboardContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const AspectDashboardContainer: FC<AspectDashboardContainerProps> = ({
  hubNameId,
  aspectNameId,
  challengeNameId = '',
  opportunityNameId = '',
  calloutNameId = '',
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
    subscribeToMore: subscribeToHub,
  } = useHubAspectQuery({
    variables: { hubNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = getCardCallout(hubData?.hub?.collaboration?.callouts, aspectNameId)?.aspects?.find(
    x => x.nameID === aspectNameId
  );

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
    subscribeToMore: subscribeToChallenge,
  } = useChallengeAspectQuery({
    variables: { hubNameId, challengeNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = getCardCallout(
    challengeData?.hub?.challenge?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
    subscribeToMore: subscribeToOpportunity,
  } = useOpportunityAspectQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const hubCommentsSubscription = useAspectCommentsMessageReceivedSubscription(
    hubData,
    hubData =>
      getCardCallout(hubData?.hub?.collaboration?.callouts, aspectNameId)?.aspects?.find(
        x => x.nameID === aspectNameId
      ),
    subscribeToHub
  );
  const challengeCommentsSubscription = useAspectCommentsMessageReceivedSubscription(
    challengeData,
    challengeData =>
      getCardCallout(challengeData?.hub?.challenge?.collaboration?.callouts, aspectNameId)?.aspects?.find(
        x => x.nameID === aspectNameId
      ),
    subscribeToChallenge
  );
  const opportunityCommentsSubscription = useAspectCommentsMessageReceivedSubscription(
    opportunityData,
    opportunityData =>
      getCardCallout(opportunityData?.hub?.opportunity?.collaboration?.callouts, aspectNameId)?.aspects?.find(
        x => x.nameID === aspectNameId
      ),
    subscribeToOpportunity
  );

  const isSubscribedToComments = [
    hubCommentsSubscription,
    challengeCommentsSubscription,
    opportunityCommentsSubscription,
  ].some(subscription => subscription.enabled);

  const { data: creatorData, loading: loadingCreator } = useAspectCreatorQuery({
    variables: { userId: aspect?.createdBy ?? '' },
    skip: !aspect,
  });
  const creator = creatorData?.user;
  const creatorAvatar = creator?.profile?.avatar?.uri;
  const creatorName = creator?.displayName;
  const createdDate = aspect?.createdDate.toString();

  const commentId = aspect?.comments?.id;
  const _messages = aspect?.comments?.messages ?? [];
  const senders = _messages.map(x => x.sender);
  const { getAuthor } = useAuthorsDetails(senders);
  const messages = useMemo<Comment[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: getAuthor(x.sender),
        createdAt: new Date(x.timestamp),
      })),
    [_messages, getAuthor]
  );

  const isAuthor = (msgId: string, userId?: string) =>
    messages.find(x => x.id === msgId)?.author?.id === userId ?? false;

  const commentsPrivileges = aspect?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [messages, user, isAuthenticated]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentFromAspectMutation({
    onError: handleError,
    update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
  });

  const handleDeleteComment = (commentId: string, messageId: string) =>
    deleteComment({
      variables: {
        messageData: {
          commentsID: commentId,
          messageID: messageId,
        },
      },
    });

  const [postComment, { loading: postingComment }] = usePostCommentInAspectMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (isSubscribedToComments) {
        return;
      }

      const cacheMessageId = cache.identify({
        id: commentId,
        __typename: 'Comments',
      });

      if (!cacheMessageId) {
        return;
      }

      cache.modify({
        id: cacheMessageId,
        fields: {
          messages(existingMessages = []) {
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendComment,
              fragment: AspectMessageFragmentDoc,
              fragmentName: 'AspectMessage',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

  const handlePostComment = async (commentId: string, message: string) =>
    postComment({
      variables: {
        messageData: {
          commentsID: commentId,
          message,
        },
      },
    });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    aspect,
    messages,
    commentId,
    creatorAvatar,
    creatorName,
    createdDate,
    handlePostComment,
    handleDeleteComment,
    loading,
    loadingCreator,
    error,
    deletingComment,
    postingComment,
  });
};
export default AspectDashboardContainer;
