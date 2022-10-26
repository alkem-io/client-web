import { AspectDashboardFragment } from '../../../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  AspectCommentsMessageReceivedSubscription,
  AspectCommentsMessageReceivedSubscriptionVariables,
} from '../../../../models/graphql-schema';
import { AspectCommentsMessageReceivedDocument } from '../../../../hooks/generated/graphql';

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
