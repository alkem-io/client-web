import { AspectDashboardFragment } from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  AspectCommentsMessageReceivedSubscription,
  AspectCommentsMessageReceivedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { AspectCommentsMessageReceivedDocument } from '../../../../core/apollo/generated/apollo-hooks';

const useAspectCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  AspectDashboardFragment,
  AspectCommentsMessageReceivedSubscription,
  AspectCommentsMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: AspectCommentsMessageReceivedDocument,
  getSubscriptionVariables: aspect => ({ aspectID: aspect.id }),
  updateSubEntity: (aspect, subscriptionData) => {
    const message = subscriptionData.aspectCommentsMessageReceived.message;
    aspect?.comments?.messages?.push(message);
  },
});

export default useAspectCommentsMessageReceivedSubscription;
