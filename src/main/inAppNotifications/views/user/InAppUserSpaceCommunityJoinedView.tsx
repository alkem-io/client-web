import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserSpaceCommunityJoinedView = (notification: InAppNotificationModel) => {
  const { payload } = notification;

  // do not display notification if these are missing
  if (!payload.space?.about?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    spaceName: payload.space?.about?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.space?.about?.profile?.url}
    />
  );
};
