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
>(
  ContextAspectCreatedDocument,
  context => ({ contextID: context.id }),
  (context, subscriptionData) => {
    context?.aspects?.push(subscriptionData.contextAspectCreated.aspect);
  }
);

export default useContextAspectCreatedSubscription;
