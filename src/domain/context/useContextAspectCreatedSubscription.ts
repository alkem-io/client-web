import { useEffect } from 'react';
import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import produce from 'immer';
import { ContextAspectCreatedDocument } from '../../hooks/generated/graphql';
import {
  AspectsOnContextFragment,
  ContextAspectCreatedSubscription,
  ContextAspectCreatedSubscriptionVariables,
} from '../../models/graphql-schema';
import { useApolloErrorHandler, useConfig } from '../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';

interface SubscribeToMore<TData, TSubscriptionVariables, TSubscriptionData> {
  (options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
}

interface UseContextAspectCreatedSubscriptionOptions<QueryData> {
  parentEntity: QueryData | undefined;
  getContext: (data: QueryData | undefined) => AspectsOnContextFragment | undefined;
  subscribeToMore: SubscribeToMore<
    QueryData,
    ContextAspectCreatedSubscriptionVariables,
    ContextAspectCreatedSubscription
  >;
}

// TODO join with domain/comments/useComments
const useContextAspectCreatedSubscription = <QueryData>(
  parentEntity: UseContextAspectCreatedSubscriptionOptions<QueryData>['parentEntity'],
  getContext: UseContextAspectCreatedSubscriptionOptions<QueryData>['getContext'],
  subscribeToMore: UseContextAspectCreatedSubscriptionOptions<QueryData>['subscribeToMore']
) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();

  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const contextId = getContext(parentEntity)?.id;

  useEffect(() => {
    if (!areSubscriptionsEnabled) {
      return;
    }

    if (!contextId) {
      return;
    }

    return subscribeToMore({
      document: ContextAspectCreatedDocument,
      variables: {
        contextID: contextId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const { aspect } = subscriptionData.data.contextAspectCreated;
        return produce(prev, next => {
          const comments = getContext(next as QueryData);
          comments?.aspects?.push(aspect);
        });
      },
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
    });
  }, [contextId, areSubscriptionsEnabled]);

  return {
    enabled: Boolean(areSubscriptionsEnabled && contextId),
  };
};

export default useContextAspectCreatedSubscription;
