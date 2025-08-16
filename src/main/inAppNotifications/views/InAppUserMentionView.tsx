import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';

export const InAppUserMentionView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (
    !payload.callout ||
    !payload.callout.framing?.profile?.displayName ||
    !payload.callout.framing?.profile?.url ||
    !triggeredBy?.profile?.displayName
  ) {
    return null;
  }

  const notificationTextValues = {
    defaultValue: '',
    triggeredByName: triggeredBy?.profile?.displayName,
    calloutName: payload.commentOriginName,
    comment: payload.comment,
  };

  return (
    <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={payload.commentUrl} />
  );
};
