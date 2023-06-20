import {
  MutationType,
  PostDashboardFragment,
  RoomEventsSubscription,
  RoomEventsSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { RoomEventsDocument } from '../../../../core/apollo/generated/apollo-hooks';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';

const usePostCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  PostDashboardFragment,
  RoomEventsSubscription,
  RoomEventsSubscriptionVariables
>({
  subscriptionDocument: RoomEventsDocument,
  getSubscriptionVariables: aspect => ({ roomID: aspect.comments.id }),
  updateSubEntity: (aspect, subscriptionData) => {
    const { message } = subscriptionData.roomEvents;

    if (message && message.type === MutationType.Create) {
      aspect?.comments?.messages?.push(message.data);
    }
  },
});

export default usePostCommentsMessageReceivedSubscription;
