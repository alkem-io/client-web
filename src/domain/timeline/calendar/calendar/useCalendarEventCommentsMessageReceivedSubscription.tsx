import {
  CalendarEventDetailsFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { RoomMessageReceivedDocument } from '../../../../core/apollo/generated/apollo-hooks';

const useCalendarEventCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  CalendarEventDetailsFragment,
  RoomMessageReceivedSubscription,
  RoomMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: RoomMessageReceivedDocument,
  getSubscriptionVariables: calendarEvent => ({ roomID: calendarEvent.comments.id }),
  updateSubEntity: (calendarEvent, subscriptionData) => {
    const message = subscriptionData.roomMessageReceived.message;
    calendarEvent?.comments?.messages?.push(message);
  },
});

export default useCalendarEventCommentsMessageReceivedSubscription;
