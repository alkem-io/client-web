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
  isDuplicated: (arg1, arg2, arg3) => {
    //console.log('IsDuplicated ', arg1, arg2, arg3);
    void arg1;
    void arg2;
    void arg3;
    return false;
  },
});

export default useContextAspectCreatedSubscription;
