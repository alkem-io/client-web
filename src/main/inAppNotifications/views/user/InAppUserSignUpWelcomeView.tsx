import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserSignUpWelcomeView = (notification: InAppNotificationModel) => {
  const { triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={triggeredBy.profile.url}
    />
  );
};
