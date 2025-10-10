import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserCommentReplyView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }
  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    parentName: messageDetails.parent?.displayName,
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
