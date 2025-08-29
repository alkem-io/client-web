import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformAdminUserProfileCreatedView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.contributor) {
    return null;
  }
  const contributor = payload.contributor;

  const notificationTextValues = {
    defaultValue: '',
    triggeredByName: triggeredBy?.profile?.displayName,
    contributorName: contributor?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.contributor?.profile?.url}
    />
  );
};
