import { useEffect } from 'react';
import { ApolloError, SubscribeToMoreOptions, TypedDocumentNode } from '@apollo/client';
import produce from 'immer';
import { useApolloErrorHandler, useConfig } from '../../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../../models/constants';
import getValuesSorted from '../utils/getValuesSorted';

interface SubscribeToMore<TData, TSubscriptionVariables, TSubscriptionData> {
  (options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
}

interface CreateUseSubscriptionToSubEntityOptions<SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription> {
  subscriptionDocument: TypedDocumentNode<SubEntitySubscription, SubEntitySubscriptionVariables>;
  getSubscriptionVariables: (subEntity: SubEntity) => SubEntitySubscriptionVariables;
  updateSubEntity: (subEntity: SubEntity | undefined, subscriptionData: SubEntitySubscription) => void;
}

/**
 * Creates and returns a hook that subscribes to the specified SubscriptionDocument by leveraging subscribeToMore()
 * from a parent query.
 * This hook factory is designed in the way so that the following parameters are bound at the factory level:
 * - SubscriptionDocument (the entity to be fetched),
 * - the getter for the subscription variables,
 * - the callback that updates the cache on a subscription message.
 * The factory produces a hook that is bound to some subscription document / response structure but allows subscribing
 * to this entity from multiple parent queries.
 * Example: by calling this factory you can create a hook that subscribes to Comments; the resulting hook you can use to
 * subscribe for Comments on Hub Aspects, Challenge Aspects and Opportunity Aspects. To the resulting hook you'll have to
 * pass different paths to Comments from different parent entities as well as subscribeToMore() from different parent queries.
 * @param options.subscriptionDocument - the subscription document to fetch.
 * @param options.getSubscriptionVariables - the function that constructs subscription variables by reading the entity.
 * @param options.updateSubEntity - the callback that updates cache based on the received subscription message; it should
 * just mutate the cache data directly by leveraging property assignments, array.push(), etc.; immutability / producing new
 * structures is ensured/handled by 'immer'.
 */
const createUseSubscriptionToSubEntityHook =
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

    const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

    const subEntity = getSubEntity(parentEntity);

    const variables = subEntity && options.getSubscriptionVariables(subEntity);

    useEffect(() => {
      if (!areSubscriptionsEnabled) {
        return;
      }

      if (!variables) {
        return;
      }

      return subscribeToMore({
        document: options.subscriptionDocument,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          return produce(prev, next => {
            const nextSubEntity = getSubEntity(next as QueryData);
            options.updateSubEntity(nextSubEntity, subscriptionData.data);
          });
        },
        onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      });
    }, [areSubscriptionsEnabled, ...(variables ? getValuesSorted(variables) : [])]);

    return {
      enabled: Boolean(areSubscriptionsEnabled && subEntity),
    };
  };

export default createUseSubscriptionToSubEntityHook;
