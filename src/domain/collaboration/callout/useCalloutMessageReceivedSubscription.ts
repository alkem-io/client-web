import createUseSubscriptionToSubEntityHook from '../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  CalloutFragment,
  CalloutMessageReceivedSubscription,
  SubscriptionCalloutMessageReceivedArgs,
} from '../../../core/apollo/generated/graphql-schema';
import { CalloutMessageReceivedDocument } from '../../../core/apollo/generated/apollo-hooks';

const useCalloutMessageReceivedSubscriptionOnExplorePage = calloutIDs =>
  createUseSubscriptionToSubEntityHook<
    CalloutFragment,
    CalloutMessageReceivedSubscription,
    SubscriptionCalloutMessageReceivedArgs
  >({
    subscriptionDocument: CalloutMessageReceivedDocument,
    getSubscriptionVariables: () => ({ calloutIDs }),
    updateSubEntity: (subEntity, subscriptionData) => {
      if (subEntity) {
        const message = subscriptionData.calloutMessageReceived.message;
        subEntity.comments?.messages?.push(message);
      }
    },
  });
export default useCalloutMessageReceivedSubscriptionOnExplorePage;
