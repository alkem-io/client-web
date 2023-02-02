import { CalendarEventDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  CalendarEventCommentsMessageReceivedSubscription,
  CalendarEventCommentsMessageReceivedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalendarEventCommentsMessageReceivedDocument } from '../../../../core/apollo/generated/apollo-hooks';

const useCalendarEventCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
  CalendarEventDetailsFragment,
  CalendarEventCommentsMessageReceivedSubscription,
  CalendarEventCommentsMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: CalendarEventCommentsMessageReceivedDocument,
  getSubscriptionVariables: calendarEvent => ({ calendarEventID: calendarEvent.id }),
  updateSubEntity: (calendarEvent, subscriptionData) => {
    const message = subscriptionData.calendarEventCommentsMessageReceived.message;
    calendarEvent?.comments?.messages?.push(message);
  },
});

export default useCalendarEventCommentsMessageReceivedSubscription;
