import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCollaborationCalloutCommentView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }

  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    calloutName: messageDetails.parent?.displayName,
    spaceName: payload.space?.about?.profile?.displayName,
    comment: messageDetails.message,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={messageDetails.parent?.url}
    />
  );
};
