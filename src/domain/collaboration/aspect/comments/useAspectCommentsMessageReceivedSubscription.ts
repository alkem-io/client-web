import {
  AspectDashboardFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { RoomMessageReceivedDocument } from '../../../../core/apollo/generated/apollo-hooks';
const useAspectCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  AspectDashboardFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: RoomMessageReceivedDocument,
  getSubscriptionVariables: aspect => ({ roomID: aspect.comments.id }),
  updateSubEntity: (aspect, subscriptionData) => {
    const message = subscriptionData.roomMessageReceived.message;
    aspect?.comments?.messages?.push(message);
  },
});

export default useAspectCommentsMessageReceivedSubscription;
