import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../models/container';
import { AspectDashboardFragment, AuthorizationPrivilege } from '../../../models/graphql-schema';
import {
  AspectMessageFragmentDoc,
  useChallengeAspectQuery,
  useHubAspectQuery,
  useOpportunityAspectQuery,
  usePostCommentInAspectMutation,
  useRemoveCommentFromAspectMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../../hooks';
import { Comment } from '../../../models/discussion/comment';
import { useAuthorsDetails } from '../../../hooks/communication/useAuthorsDetails';
import { evictFromCache } from '../../../utils/apollo-cache/removeFromCache';

export interface AspectDashboardPermissions {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteMessage: (msgId: string) => boolean;
}

export interface AspectDashboardContainerEntities {
  aspect?: AspectDashboardFragment;
  messages: Comment[];
  commentId?: string;
  permissions: AspectDashboardPermissions;
}

export interface AspectDashboardContainerActions {
  handlePostComment: (commentId: string, message: string) => void;
  handleDeleteComment: (commentId: string, messageId: string) => void;
}

export interface AspectDashboardContainerState {
  loading: boolean;
  error?: ApolloError;
  deletingComment?: boolean;
  postingComment?: boolean;
}

export interface AspectDashboardContainerProps
  extends ContainerChildProps<
    AspectDashboardContainerEntities,
    AspectDashboardContainerActions,
    AspectDashboardContainerState
  > {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  aspectNameId: string;
}

const AspectDashboardContainer: FC<AspectDashboardContainerProps> = ({
  children,
  hubNameId,
  aspectNameId,
  challengeNameId = '',
  opportunityNameId = '',
}) => {
  const handleError = useApolloErrorHandler();
  const { user: userMetadata, isAuthenticated } = useUserContext();
  const user = userMetadata?.user;

  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectQuery({
    variables: { hubNameId, aspectNameId },
    skip: !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = hubData?.hub?.context?.aspects?.[0];

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectQuery({
    variables: { hubNameId, challengeNameId, aspectNameId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = challengeData?.hub?.challenge?.context?.aspects?.[0];

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = opportunityData?.hub?.opportunity?.context?.aspects?.[0];

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const commentId = aspect?.comments?.id;
  const _messages = aspect?.comments?.messages ?? [];
  const senders = _messages.map(x => x.sender);
  const { getAuthor } = useAuthorsDetails(senders);
  const messages: Comment[] =
    _messages &&
    _messages.map(x => ({
      id: x.id,
      body: x.message,
      author: getAuthor(x.sender),
      createdAt: new Date(x.timestamp),
    }));

  const isAuthor = (msgId: string, userId?: string) =>
    messages.find(x => x.id === msgId)?.author?.id === userId ?? false;

  const commentsPrivileges = aspect?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteComments = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    msgId => canDeleteComments || (isAuthenticated && isAuthor(msgId, user?.id)),
    [messages, user, isAuthenticated]
  );

  const permissions: AspectDashboardPermissions = {
    canReadComments: commentsPrivileges.includes(AuthorizationPrivilege.Read) ?? false,
    canPostComments: commentsPrivileges.includes(AuthorizationPrivilege.CreateComment) ?? false,
    canDeleteMessage,
  };

  const [deleteComment, { loading: deletingComment }] = useRemoveCommentFromAspectMutation({
    onError: handleError,
    update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
  });
  const handleDeleteComment = async (commentId: string, messageId: string) => {
    await deleteComment({
      variables: {
        messageData: {
          commentsID: commentId,
          messageID: messageId,
        },
      },
    });
  };

  const [postComment, { loading: postingComment }] = usePostCommentInAspectMutation({
    onError: handleError,
    update: (cache, { data }) => {
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
  const handlePostComment = async (commentId: string, message: string) => {
    await postComment({
      variables: {
        messageData: {
          commentsID: commentId,
          message,
        },
      },
    });
  };

  return (
    <>
      {children(
        { aspect, permissions, messages, commentId },
        { loading, error, postingComment, deletingComment },
        { handlePostComment, handleDeleteComment }
      )}
    </>
  );
};
export default AspectDashboardContainer;
