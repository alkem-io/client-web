import { useEffect } from 'react';
import { ApolloError, SubscribeToMoreOptions, TypedDocumentNode } from '@apollo/client';
import produce from 'immer';
import { useApolloErrorHandler, useConfig, useUserContext } from '../../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../../models/constants';

interface SubscribeToMore<TData, TSubscriptionVariables, TSubscriptionData> {
  (options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
}

interface CreateUseSubscriptionToSubEntityOptions<SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription> {
  subscriptionDocument: TypedDocumentNode<SubEntitySubscription, SubEntitySubscriptionVariables>;
  getSubscriptionVariables: (subEntity: SubEntity) => SubEntitySubscriptionVariables;
  updateSubEntity: (
    subEntity: SubEntity | undefined,
    subscriptionData: SubEntitySubscription,
    currentUserId: string | undefined
  ) => void;
}

const createUseSubscriptionToSubEntity =
  <SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription>(
    options: CreateUseSubscriptionToSubEntityOptions<SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription>
  ) =>
  <QueryData>(
    parentEntity: QueryData | undefined,
    getSubEntity: (data: QueryData | undefined) => SubEntity | undefined,
    subscribeToMore: SubscribeToMore<QueryData, SubEntitySubscriptionVariables, SubEntitySubscription>
  ) => {
    const handleError = useApolloErrorHandler();
    const { isFeatureEnabled } = useConfig();
    const { user } = useUserContext();

    const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

    const subEntity = getSubEntity(parentEntity);

    useEffect(() => {
      if (!areSubscriptionsEnabled) {
        return;
      }

      if (!subEntity) {
        return;
      }

      return subscribeToMore({
        document: options.subscriptionDocument,
        variables: options.getSubscriptionVariables(subEntity),
        updateQuery: (prev, { subscriptionData }) => {
          return produce(prev, next => {
            const nextSubEntity = getSubEntity(next as QueryData);
            options.updateSubEntity(nextSubEntity, subscriptionData.data, user?.user?.id);
          });
        },
        onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      });
    }, [subEntity, areSubscriptionsEnabled, user]);

    return {
      enabled: Boolean(areSubscriptionsEnabled && subEntity),
    };
  };

export default createUseSubscriptionToSubEntity;
