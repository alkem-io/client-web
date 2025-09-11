import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformAdminUserProfileRemovedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    userEmail: payload.userEmail || '',
    userName: payload.userDisplayName || '',
  };

  return <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={''} />;
};
