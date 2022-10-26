import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { AspectDashboardFragment, AuthorizationPrivilege, Scalars } from '../../../models/graphql-schema';
import {
  MessageDetailsFragmentDoc,
  useChallengeAspectQuery,
  useHubAspectQuery,
  useOpportunityAspectQuery,
  usePostCommentInAspectMutation,
  useRemoveCommentFromAspectMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../hooks';
import { Message } from '../../../domain/shared/components/Comments/models/message';
import { useAuthorsDetails } from '../../../domain/communication/communication/useAuthorsDetails';
import { evictFromCache } from '../../../domain/shared/utils/apollo-cache/removeFromCache';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../common/utils/containers/ComponentOrChildrenFn';
import useAspectCommentsMessageReceivedSubscription from '../../../domain/collaboration/aspect/comments/useAspectCommentsMessageReceivedSubscription';
import { getCardCallout } from '../getAspectCallout';
import { buildAspectUrl } from '../../../common/utils/urlBuilders';

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
  aspectUrl: string;
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

  const creator = aspect?.createdBy;
  const creatorAvatar = creator?.profile?.avatar?.uri;
  const creatorName = creator?.displayName;
  const createdDate = aspect?.createdDate.toString();

  const commentsId = aspect?.comments?.id;
  const _messages = useMemo(() => aspect?.comments?.messages ?? [], [aspect?.comments?.messages]);
  const senders = _messages.map(x => x.sender.id);
  const { getAuthor } = useAuthorsDetails(senders);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: getAuthor(x.sender.id),
        createdAt: new Date(x.timestamp),
      })),
    [_messages, getAuthor]
  );

  const isAuthor = useCallback(
    (msgId: string, userId?: string) => messages.find(x => x.id === msgId)?.author?.id === userId ?? false,
    [messages]
  );

  const commentsPrivileges = aspect?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteComment = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [user, isAuthenticated, canDeleteComments, isAuthor]
  );

  const canReadComments = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const canPostComments = commentsPrivileges.includes(AuthorizationPrivilege.CreateComment);

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentFromAspectMutation({
    onError: handleError,
    update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
  });

  const handleDeleteComment = (commentsId: string, messageId: string) =>
    deleteComment({
      variables: {
        messageData: {
          commentsID: commentsId,
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
          messages(existingMessages = []) {
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendComment,
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
          commentsID: commentsId,
          message,
        },
      },
    });

  const aspectUrl = buildAspectUrl({ hubNameId, challengeNameId, opportunityNameId, calloutNameId, aspectNameId });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    aspect,
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
    aspectUrl,
  });
};
export default AspectDashboardContainer;
