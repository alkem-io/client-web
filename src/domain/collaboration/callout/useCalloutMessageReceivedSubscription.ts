import createUseSubscriptionToSubEntityHook from '../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  CalloutFragment,
  CalloutMessageReceivedSubscription,
  SubscriptionCalloutMessageReceivedArgs,
} from '../../../models/graphql-schema';
import { CalloutMessageReceivedDocument } from '../../../hooks/generated/graphql';

const useCalloutMessageReceivedSubscriptionOnExplorePage = (calloutIDs) => createUseSubscriptionToSubEntityHook<
  CalloutFragment,
  CalloutMessageReceivedSubscription,
  SubscriptionCalloutMessageReceivedArgs
  >({
  subscriptionDocument: CalloutMessageReceivedDocument,
  getSubscriptionVariables: () => ({ calloutIDs }),
  updateSubEntity: (subEntity, subscriptionData) => {
    if (subEntity) {
      subEntity.comments?.messages?.push(subscriptionData.calloutMessageReceived.message);
    }
  }
});
export default useCalloutMessageReceivedSubscriptionOnExplorePage;
