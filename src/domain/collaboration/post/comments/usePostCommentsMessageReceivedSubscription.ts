import {
  PostDashboardFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { RoomMessageReceivedDocument } from '../../../../core/apollo/generated/apollo-hooks';
const usePostCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  PostDashboardFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: RoomMessageReceivedDocument,
  getSubscriptionVariables: post => ({ roomID: post.comments.id }),
  updateSubEntity: (post, subscriptionData) => {
    const message = subscriptionData.roomMessageReceived.message;
    post?.comments?.messages?.push(message);
  },
});

export default usePostCommentsMessageReceivedSubscription;
