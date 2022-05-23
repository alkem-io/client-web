import { ContextAspectCreatedDocument } from '../../hooks/generated/graphql';
import {
  AspectsOnContextFragment,
  ContextAspectCreatedSubscription,
  ContextAspectCreatedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntity from '../shared/subscriptions/useSubscriptionToSubEntity';

const useContextAspectCreatedSubscription = createUseSubscriptionToSubEntity<
  AspectsOnContextFragment,
  ContextAspectCreatedSubscriptionVariables,
  ContextAspectCreatedSubscription
>({
  subscriptionDocument: ContextAspectCreatedDocument,
  getSubscriptionVariables: context => ({ contextID: context.id }),
  updateSubEntity: (context, subscriptionData, currentUserId) => {
    const aspect = subscriptionData.contextAspectCreated.aspect;
    if (aspect.createdBy !== currentUserId) {
      context?.aspects?.push(aspect);
    }
  },
});

export default useContextAspectCreatedSubscription;
