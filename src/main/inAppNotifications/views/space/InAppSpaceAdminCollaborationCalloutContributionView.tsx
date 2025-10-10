import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { mapInAppNotificationPayloadSpaceCollaborationCalloutToModel } from '../../util/mapInAppNotificationPayloadSpaceCollaborationCalloutToModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceAdminCollaborationCalloutContributionView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.callout) {
    return null;
  }
  const inAppPayloadSpaceCollaborationCallout = mapInAppNotificationPayloadSpaceCollaborationCalloutToModel(payload);
  if (!inAppPayloadSpaceCollaborationCallout) {
    return null;
  }
  const callout = payload.callout;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    calloutName: callout.framing?.profile?.displayName,
    spaceName: payload.space?.about?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.callout.framing?.profile?.url}
    />
  );
};
