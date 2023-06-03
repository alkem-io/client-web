import createUseSubscriptionToSubEntityHook from '../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  CalloutFragment,
  RoomMessageReceivedSubscription,
  SubscriptionRoomMessageReceivedArgs,
} from '../../../core/apollo/generated/graphql-schema';
import { RoomMessageReceivedDocument } from '../../../core/apollo/generated/apollo-hooks';

const useCalloutMessageReceivedSubscriptionOnExplorePage = calloutIDs =>
  createUseSubscriptionToSubEntityHook<
    CalloutFragment,
    RoomMessageReceivedSubscription,
    SubscriptionRoomMessageReceivedArgs
  >({
    subscriptionDocument: RoomMessageReceivedDocument,
    getSubscriptionVariables: () => ({ calloutIDs }), // todo: expand the args on the subscription to send in a set of room IDs
    updateSubEntity: (subEntity, subscriptionData) => {
      if (subEntity) {
        const message = subscriptionData.roomMessageReceived.message;
        subEntity.comments?.messages?.push(message);
      }
    },
  });
export default useCalloutMessageReceivedSubscriptionOnExplorePage;
