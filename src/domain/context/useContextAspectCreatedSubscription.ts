import { ContextAspectCreatedDocument } from '../../hooks/generated/graphql';
import {
  AspectsOnContextFragment,
  ContextAspectCreatedSubscription,
  ContextAspectCreatedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../shared/subscriptions/useSubscriptionToSubEntity';

const useContextAspectCreatedSubscription = createUseSubscriptionToSubEntityHook<
  AspectsOnContextFragment,
  ContextAspectCreatedSubscription,
  ContextAspectCreatedSubscriptionVariables
>({
  subscriptionDocument: ContextAspectCreatedDocument,
  getSubscriptionVariables: context => ({ contextID: context.id }),
  updateSubEntity: (context, subscriptionData) => {
    context?.aspects?.push(subscriptionData.contextAspectCreated.aspect);
  },
});

export default useContextAspectCreatedSubscription;
