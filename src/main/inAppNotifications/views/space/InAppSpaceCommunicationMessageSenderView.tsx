import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCommunicationMessageSenderView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }
  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: messageDetails.parent?.displayName,
    message: messageDetails.message,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={messageDetails.parent?.url}
    />
  );
};
