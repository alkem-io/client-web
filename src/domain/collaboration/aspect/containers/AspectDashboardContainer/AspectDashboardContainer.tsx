import { FC, useCallback, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AspectDashboardFragment,
  AuthorizationPrivilege,
  Scalars,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  useChallengeAspectQuery,
  useHubAspectQuery,
  useOpportunityAspectQuery,
  useRemoveMessageOnRoomMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/contributor/user';
import { Message } from '../../../../communication/room/models/Message';
import { evictFromCache } from '../../../../shared/utils/apollo-cache/removeFromCache';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../common/utils/containers/ComponentOrChildrenFn';
import useAspectCommentsMessageReceivedSubscription from '../../comments/useAspectCommentsMessageReceivedSubscription';
import { getCardCallout } from '../getAspectCallout';
import { buildAspectUrl } from '../../../../../common/utils/urlBuilders';
import { buildAuthorFromUser } from '../../../../../common/utils/buildAuthorFromUser';
import usePostMessageMutations from '../../../../communication/room/Comments/usePostMessageMutations';

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
  roomId: string | undefined;
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  postMessage: (message: string) => void;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  handleDeleteComment: (commentsId: string, messageId: string) => void;
  loading: boolean;
  error?: ApolloError;
  deletingComment: boolean;
  postingMessage: boolean;
  postingReply: boolean;
  aspectUrl: string;
}

export type AspectDashboardContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const AspectDashboardContainer: FC<AspectDashboardContainerProps> = ({
  hubNameId,
  aspectNameId,
  challengeNameId,
  opportunityNameId,
  calloutNameId = '',
  ...rendered
}) => {
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
    fetchPolicy: 'cache-and-network',
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
    variables: { hubNameId, challengeNameId: challengeNameId!, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !challengeNameId || !!opportunityNameId,
    fetchPolicy: 'cache-and-network',
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
    variables: { hubNameId, opportunityNameId: opportunityNameId!, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !opportunityNameId,
    fetchPolicy: 'cache-and-network',
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

  const isSubscribedToMessages = [
    hubCommentsSubscription,
    challengeCommentsSubscription,
    opportunityCommentsSubscription,
  ].some(subscription => subscription.enabled);

  const creator = aspect?.createdBy;
  const creatorAvatar = creator?.profile.visual?.uri;
  const creatorName = creator?.profile.displayName;
  const createdDate = aspect?.createdDate.toString();

  const roomId = aspect?.comments?.id;
  const _messages = useMemo(() => aspect?.comments?.messages ?? [], [aspect?.comments?.messages]);
  const messages = useMemo<Message[]>(
    () =>
      _messages?.map(x => ({
        id: x.id,
        body: x.message,
        author: x?.sender ? buildAuthorFromUser(x.sender) : undefined,
        createdAt: new Date(x.timestamp),
        reactions: x.reactions,
      })),
    [_messages]
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

  const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
    roomId,
    isSubscribedToMessages,
  });

  const aspectUrl = buildAspectUrl(calloutNameId, aspectNameId, {
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  return renderComponentOrChildrenFn(rendered, {
    canReadComments,
    canPostComments,
    canDeleteComment,
    aspect,
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
    aspectUrl,
  });
};

export default AspectDashboardContainer;
