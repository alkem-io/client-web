import { useEffect } from 'react';
import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import produce from 'immer';
import { CommentsDocument } from '../../hooks/generated/graphql';
import { Comments, CommentsSubscription, CommentsSubscriptionVariables } from '../../models/graphql-schema';
import { useApolloErrorHandler, useConfig } from '../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';

interface SubscribeToMore<TData, TSubscriptionVariables, TSubscriptionData> {
  (options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
}

interface UseCommentsOptions<QueryData> {
  parentEntity: QueryData | undefined;
  getComments: (data: QueryData | undefined) => Omit<Comments, 'authorization'> | undefined;
  subscribeToMore: SubscribeToMore<QueryData, CommentsSubscriptionVariables, CommentsSubscription>;
}

const useComments = <QueryData>(
  parentEntity: UseCommentsOptions<QueryData>['parentEntity'],
  getComments: UseCommentsOptions<QueryData>['getComments'],
  subscribeToMore: UseCommentsOptions<QueryData>['subscribeToMore']
) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();

  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const commentsId = getComments(parentEntity)?.id;

  useEffect(() => {
    if (!areSubscriptionsEnabled) {
      return;
    }

    if (!commentsId) {
      return;
    }

    return subscribeToMore({
      document: CommentsDocument,
      variables: {
        commentsId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const { message } = subscriptionData.data.communicationCommentsMessageReceived;
        return produce(prev, next => {
          const comments = getComments(next as QueryData);
          comments?.messages?.push(message);
        });
      },
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
    });
  }, [commentsId, areSubscriptionsEnabled]);

  return {
    enabled: Boolean(areSubscriptionsEnabled && commentsId),
  };
};

export default useComments;
