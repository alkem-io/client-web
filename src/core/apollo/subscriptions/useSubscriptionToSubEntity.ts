import { OperationVariables, TypedDocumentNode } from '@apollo/client';
import produce from 'immer';
import useSubscribeToMore, { Options, SubscribeToMore } from './useSubscribeToMore';

interface CreateUseSubscriptionToSubEntityOptions<SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription> {
  subscriptionDocument: TypedDocumentNode<SubEntitySubscription, SubEntitySubscriptionVariables>;
  getSubscriptionVariables?: (subEntity: SubEntity) => SubEntitySubscriptionVariables | undefined;
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
 * subscribe for Comments on Space Posts, Challenge Posts and Opportunity Posts. To the resulting hook you'll have to
 * pass different paths to Comments from different parent entities as well as subscribeToMore() from different parent queries.
 * @param options.subscriptionDocument - the subscription document to fetch.
 * @param options.getSubscriptionVariables - the function that constructs subscription variables by reading the entity.
 * @param options.updateSubEntity - the callback that updates cache based on the received subscription message; it should
 * just mutate the cache data directly by leveraging property assignments, array.push(), etc.; immutability / producing new
 * structures is ensured/handled by 'immer'.
 */
// todo rename createUseSubscriptionToParentQuery
const createUseSubscriptionToSubEntityHook =
  <SubEntity, SubEntitySubscription, SubEntitySubscriptionVariables extends OperationVariables>(
    options: CreateUseSubscriptionToSubEntityOptions<SubEntity, SubEntitySubscriptionVariables, SubEntitySubscription>
  ) =>
  <QueryData>(
    parentEntity: QueryData | undefined,
    getSubEntity: (data: QueryData | undefined) => SubEntity | undefined | null, // Some queries give nulls when the type actually says undefined.
    subscribeToMore: SubscribeToMore<QueryData>,
    subscriptionOptions: Options<SubEntitySubscriptionVariables> = { skip: false }
  ) => {
    const subEntity = getSubEntity(parentEntity) ?? undefined;

    const variables = subEntity && options.getSubscriptionVariables?.(subEntity);

    const skip = subscriptionOptions.skip || typeof subEntity === 'undefined';

    return useSubscribeToMore<QueryData, SubEntitySubscription, SubEntitySubscriptionVariables>(subscribeToMore, {
      document: options.subscriptionDocument,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        return produce(prev, next => {
          const nextSubEntity = getSubEntity(next as QueryData) ?? undefined;
          options.updateSubEntity(nextSubEntity, subscriptionData.data as SubEntitySubscription);
        });
      },
      ...subscriptionOptions,
      skip,
    });
  };

export default createUseSubscriptionToSubEntityHook;
