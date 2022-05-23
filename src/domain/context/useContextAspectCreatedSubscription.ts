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
  updateSubEntity: (context, subscriptionData) => {
    const aspect = subscriptionData.contextAspectCreated.aspect;
    const aspects = context?.aspects || [];
    if (aspects.findIndex(a => a.id === aspect.id) === -1) {
      context?.aspects?.push(aspect);
    }
  },
});

export default useContextAspectCreatedSubscription;
