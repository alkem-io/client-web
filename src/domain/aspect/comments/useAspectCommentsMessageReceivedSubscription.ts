import { AspectDashboardFragment } from '../../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  AspectCommentsMessageReceivedSubscription,
  AspectCommentsMessageReceivedSubscriptionVariables,
} from '../../../models/graphql-schema';
import { AspectCommentsMessageReceivedDocument } from '../../../hooks/generated/graphql';

const useAspectCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  AspectDashboardFragment,
  AspectCommentsMessageReceivedSubscription,
  AspectCommentsMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: AspectCommentsMessageReceivedDocument,
  getSubscriptionVariables: aspect => ({ aspectID: aspect.id }),
  updateSubEntity: (aspect, subscriptionData) => {
    aspect?.comments?.messages?.push(subscriptionData.aspectCommentsMessageReceived.message);
  },
});

export default useAspectCommentsMessageReceivedSubscription;
