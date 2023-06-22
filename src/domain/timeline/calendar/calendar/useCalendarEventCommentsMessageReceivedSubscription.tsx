import {
  CalendarEventDetailsFragment,
  MutationType,
  RoomEventsSubscription,
  RoomEventsSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { RoomEventsDocument } from '../../../../core/apollo/generated/apollo-hooks';

const useCalendarEventCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  CalendarEventDetailsFragment,
  RoomEventsSubscription,
  RoomEventsSubscriptionVariables
>({
  subscriptionDocument: RoomEventsDocument,
  getSubscriptionVariables: calendarEvent => ({ roomID: calendarEvent.comments.id }),
  updateSubEntity: (calendarEvent, subscriptionData) => {
    const { message } = subscriptionData.roomEvents;

    if (message && message.type === MutationType.Create) {
      calendarEvent?.comments?.messages?.push(message.data);
    }
  },
});

export default useCalendarEventCommentsMessageReceivedSubscription;
