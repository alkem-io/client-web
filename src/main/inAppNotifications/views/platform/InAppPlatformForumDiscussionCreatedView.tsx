import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformForumDiscussionCreatedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.discussion) {
    return null;
  }
  const discussion = payload.discussion;

  const notificationTextValues = {
    triggeredByName: triggeredBy?.profile?.displayName,
    discussionName: discussion.displayName,
  };

  return (
    <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={discussion?.url} />
  );
};
