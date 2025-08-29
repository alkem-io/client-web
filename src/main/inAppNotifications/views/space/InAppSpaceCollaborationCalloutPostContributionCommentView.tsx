import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { mapInAppNotificationPayloadSpaceCollaborationCalloutToModel } from '../../util/mapInAppNotificationPayloadSpaceCollaborationCalloutToModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCollaborationCalloutPostContributionCommentView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }

  const inAppPayloadSpaceCollaborationCallout = mapInAppNotificationPayloadSpaceCollaborationCalloutToModel(payload);

  if (!inAppPayloadSpaceCollaborationCallout) {
    return null;
  }
  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    defaultValue: '',
    triggeredByName: triggeredBy?.profile?.displayName,
    calloutName: messageDetails?.parent?.displayName,
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
