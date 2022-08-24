import { CalloutAspectCreatedDocument } from '../../hooks/generated/graphql';
import {
  AspectsOnCalloutFragment,
  CalloutAspectCreatedSubscription,
  CalloutAspectCreatedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../shared/subscriptions/useSubscriptionToSubEntity';

const useCalloutAspectCreatedSubscription = createUseSubscriptionToSubEntityHook<
  AspectsOnCalloutFragment,
  CalloutAspectCreatedSubscription,
  CalloutAspectCreatedSubscriptionVariables
>({
  subscriptionDocument: CalloutAspectCreatedDocument,
  getSubscriptionVariables: callout => ({ calloutID: callout.id }),
  updateSubEntity: (callout, subscriptionData) => {
    callout?.aspects?.push(subscriptionData.calloutAspectCreated.aspect);
  },
});

export default useCalloutAspectCreatedSubscription;
