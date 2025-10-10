import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCollaborationCalloutPostContributionCommentView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }

  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    contributionName: messageDetails.parent?.displayName,
    comment: messageDetails.message,
    spaceName: payload.space?.about?.profile?.displayName || '',
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={messageDetails.parent?.url}
    />
  );
};
