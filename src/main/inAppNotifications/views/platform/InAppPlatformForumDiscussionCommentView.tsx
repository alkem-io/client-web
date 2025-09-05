import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformForumDiscussionCommentView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }
  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    defaultValue: '',
    triggeredByName: triggeredBy?.profile?.displayName,
    discussionName: messageDetails?.parent?.displayName,
    comment: messageDetails?.message,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.messageDetails?.parent?.url}
    />
  );
};
