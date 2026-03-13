import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCollaborationPollView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // Do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.space || !payload.callout) {
    return null;
  }

  const space = payload.space;
  const callout = payload.callout;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: space?.about?.profile?.displayName,
    calloutName: callout?.framing?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={callout?.framing?.profile?.url}
    />
  );
};
