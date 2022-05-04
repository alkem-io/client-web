import { useEffect } from 'react';
import { ApolloError, SubscribeToMoreOptions, TypedDocumentNode } from '@apollo/client';
import produce from 'immer';
import { useApolloErrorHandler, useConfig } from '../../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../../models/constants';

interface SubscribeToMore<TData, TSubscriptionVariables, TSubscriptionData> {
  (options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
}

interface UseSubscriptionToSubEntityOptions<
  QueryData,
  SubEntity extends { id: string },
  SubEntitySubscriptionVariables,
  SubEntitySubscription
> {
  parentEntity: QueryData | undefined;
  getSubEntity: (data: QueryData | undefined) => SubEntity | undefined;
  subscribeToMore: SubscribeToMore<QueryData, SubEntitySubscriptionVariables, SubEntitySubscription>;
}

const createUseSubscriptionToSubEntity =
  <SubEntity extends { id: string }, SubEntitySubscriptionVariables, SubEntitySubscription>(
    subscriptionDocument: TypedDocumentNode<SubEntitySubscription, SubEntitySubscriptionVariables>,
    getSubscriptionQueryVariables: (subEntity: SubEntity) => SubEntitySubscriptionVariables,
    updateSubEntity: (subEntity: SubEntity | undefined, subscriptionData: SubEntitySubscription) => void
  ) =>
  <QueryData>(
    parentEntity: UseSubscriptionToSubEntityOptions<
      QueryData,
      SubEntity,
      SubEntitySubscriptionVariables,
      SubEntitySubscription
    >['parentEntity'],
    getSubEntity: UseSubscriptionToSubEntityOptions<
      QueryData,
      SubEntity,
      SubEntitySubscriptionVariables,
      SubEntitySubscription
    >['getSubEntity'],
    subscribeToMore: UseSubscriptionToSubEntityOptions<
      QueryData,
      SubEntity,
      SubEntitySubscriptionVariables,
      SubEntitySubscription
    >['subscribeToMore']
  ) => {
    const handleError = useApolloErrorHandler();
    const { isFeatureEnabled } = useConfig();

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
        document: subscriptionDocument,
        variables: getSubscriptionQueryVariables(subEntity),
        updateQuery: (prev, { subscriptionData }) => {
          return produce(prev, next => {
            const nextSubEntity = getSubEntity(next as QueryData);
            updateSubEntity(nextSubEntity, subscriptionData.data);
          });
        },
        onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      });
    }, [subEntity, areSubscriptionsEnabled]);

    return {
      enabled: Boolean(areSubscriptionsEnabled && subEntity),
    };
  };

export default createUseSubscriptionToSubEntity;
