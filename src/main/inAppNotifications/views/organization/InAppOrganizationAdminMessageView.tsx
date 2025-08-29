import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppOrganizationAdminMessageView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.messageDetails) {
    return null;
  }
  const messageDetails = payload.messageDetails;

  const notificationTextValues = {
    defaultValue: '',
    triggeredByName: triggeredBy?.profile?.displayName,
    organizationName: messageDetails?.parent?.displayName,
    message: messageDetails?.message,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.messageDetails?.parent?.url}
    />
  );
};
