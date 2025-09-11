import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformAdminGlobalRoleChangedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    userName: payload.user?.profile?.displayName,
    role: payload.role,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.user?.profile?.url}
    />
  );
};
