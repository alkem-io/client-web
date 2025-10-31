import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCommunityCalendarEventCreatedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // Do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.space || !payload.calendarEvent) {
    return null;
  }

  const space = payload.space;
  const calendarEvent = payload.calendarEvent;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: space?.about?.profile?.displayName,
    type: calendarEvent.type,
    eventTitle: calendarEvent.profile.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={calendarEvent.profile.url}
    />
  );
};
